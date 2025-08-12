import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { collection, getFirestore, query, where, onSnapshot, doc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { app, auth, db } from '../firebase/firebaseConfig';
import { Feather } from '@expo/vector-icons';
import SALGUEIRO_LOCATIONS from '../componets/salgueiroLocations.json';

export default function BuscarCorrida({ navigation }) {
  // Filtros de pesquisa
  const [destinoFiltro, setDestinoFiltro] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');
  const [horarioFiltro, setHorarioFiltro] = useState('');
  const [valorMinFiltro, setValorMinFiltro] = useState('');
  const [valorMaxFiltro, setValorMaxFiltro] = useState('');
  const [distanciaMinFiltro, setDistanciaMinFiltro] = useState('');
  const [distanciaMaxFiltro, setDistanciaMaxFiltro] = useState('');

  // Dados das corridas
  const [allCorridas, setAllCorridas] = useState([]);
  const [filteredCorridas, setFilteredCorridas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para as sugestões de autocomplete
  const [filteredDestinationSuggestions, setFilteredDestinationSuggestions] = useState([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Lógica de filtro e autocomplete para o destino (memorizada com useCallback)
  const handleDestinationFilterChange = useCallback((text) => {
    setDestinoFiltro(text);
    if (text.length > 0) {
      const filtered = SALGUEIRO_LOCATIONS.filter(location =>
        location.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDestinationSuggestions(filtered);
      setShowDestinationSuggestions(true);
    } else {
      setShowDestinationSuggestions(false);
    }
  }, []);

  const selectDestinationFilter = useCallback((location) => {
    setDestinoFiltro(location.nome);
    setShowDestinationSuggestions(false);
  }, []);

  // Efeito para buscar as corridas ativas do Firestore
  useEffect(() => {
    setLoading(true);
    const corridasRef = collection(db, 'corridas');
    const q = query(corridasRef, where('status', '==', 'Ativa'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCorridas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllCorridas(fetchedCorridas);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar corridas:", error);
      Alert.alert('Erro', 'Não foi possível carregar as corridas disponíveis.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Efeito para aplicar todos os filtros
  useEffect(() => {
    let filtered = allCorridas;
    
    // Filtro por destino
    if (destinoFiltro.trim() !== '') {
      filtered = filtered.filter(corrida =>
        corrida.destino.toLowerCase().includes(destinoFiltro.toLowerCase())
      );
    }

    // Filtro por data
    if (dataFiltro.trim() !== '') {
      filtered = filtered.filter(corrida =>
        corrida.data && corrida.data.includes(dataFiltro)
      );
    }

    // Filtro por horário
    if (horarioFiltro.trim() !== '') {
      filtered = filtered.filter(corrida =>
        corrida.horario && corrida.horario.includes(horarioFiltro)
      );
    }

    // Filtro por valor
    const minValor = parseFloat(valorMinFiltro.replace(',', '.'));
    const maxValor = parseFloat(valorMaxFiltro.replace(',', '.'));
    if (!isNaN(minValor)) {
      filtered = filtered.filter(corrida => corrida.valor >= minValor);
    }
    if (!isNaN(maxValor)) {
      filtered = filtered.filter(corrida => corrida.valor <= maxValor);
    }

    // Filtro por distância
    const minDistancia = parseFloat(distanciaMinFiltro.replace(',', '.'));
    const maxDistancia = parseFloat(distanciaMaxFiltro.replace(',', '.'));
    if (!isNaN(minDistancia)) {
      filtered = filtered.filter(corrida => parseFloat(corrida.distancia) >= minDistancia);
    }
    if (!isNaN(maxDistancia)) {
      filtered = filtered.filter(corrida => parseFloat(corrida.distancia) <= maxDistancia);
    }

    setFilteredCorridas(filtered);
  }, [destinoFiltro, dataFiltro, horarioFiltro, valorMinFiltro, valorMaxFiltro, distanciaMinFiltro, distanciaMaxFiltro, allCorridas]);

  async function handleAceitarCorrida(corrida) {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para aceitar uma corrida.');
      return;
    }

    const isAlreadyPassenger = corrida.passengerUids && corrida.passengerUids.includes(user.uid);
    if (isAlreadyPassenger) {
      Alert.alert('Atenção', 'Você já aceitou esta corrida.');
      return;
    }

    const passageirosAtuais = corrida.passageiros ? corrida.passageiros.length : 0;
    if (passageirosAtuais >= corrida.lugaresDisponiveis) {
      Alert.alert('Corrida Lotada', 'Desculpe, esta corrida não tem mais lugares disponíveis.');
      return;
    }

    if (corrida.motoristaId === user.uid) {
      Alert.alert('Atenção', 'Você não pode aceitar sua própria corrida como passageiro.');
      return;
    }

    setLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        const passengerRef = doc(db, 'users', user.uid);
        const driverRef = doc(db, 'users', corrida.motoristaId);
        const corridaRef = doc(db, 'corridas', corrida.id);

        const passengerDoc = await transaction.get(passengerRef);
        const driverDoc = await transaction.get(driverRef);
        const corridaDoc = await transaction.get(corridaRef);

        if (!passengerDoc.exists() || !driverDoc.exists() || !corridaDoc.exists()) {
          throw new Error("Documentos não encontrados! Tente novamente.");
        }

        const passengerData = passengerDoc.data();
        const driverData = driverDoc.data();
        const corridaData = corridaDoc.data();

        const valorCorrida = corridaData.valor;
        const currentPassengerBalance = passengerData.balance || 0;
        const currentDriverBalance = driverData.balance || 0;

        if (currentPassengerBalance < valorCorrida) {
          throw new Error("Saldo insuficiente para aceitar esta corrida.");
        }

        const currentPassageiros = corridaData.passageiros ? corridaData.passageiros.length : 0;
        if (currentPassageiros >= corridaData.lugaresDisponiveis) {
          throw new Error("Corrida lotada enquanto você tentava aceitar.");
        }
        
        transaction.update(passengerRef, {
          balance: currentPassengerBalance - valorCorrida
        });
        transaction.update(driverRef, {
          balance: currentDriverBalance + valorCorrida
        });
        transaction.update(corridaRef, {
          passageiros: arrayUnion({ uid: user.uid, nome: user.displayName || 'Passageiro Desconhecido' }),
          passengerUids: arrayUnion(user.uid)
        });
      });

      Alert.alert('Sucesso', 'Corrida aceita! O valor foi transferido para o motorista.');
      if (navigation) {
        navigation.navigate('MinhasCorridas');
      }

    } catch (error) {
      console.error('Erro na transação de aceitar corrida:', error);
      Alert.alert('Erro', error.message || 'Não foi possível aceitar a corrida. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const renderCorrida = ({ item }) => {
    const passageirosAtuais = item.passageiros ? item.passageiros.length : 0;
    const estaLotada = passageirosAtuais >= item.lugaresDisponiveis;

    return (
      <View style={styles.corridaItem}>
        <Text style={styles.corridaTitle}>
          <Feather name="map-pin" size={18} color="#6B46C1" /> {item.origem} → {item.destino}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.detailText}><Feather name="calendar" size={14} color="#4A5568" /> {item.data}</Text>
          <Text style={styles.detailText}><Feather name="clock" size={14} color="#4A5568" /> {item.horario}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.detailText}><Feather name="dollar-sign" size={14} color="#38A169" /> R$ {item.valor ? item.valor.toFixed(2).replace('.', ',') : '0,00'}</Text>
          <Text style={styles.detailText}><Feather name="trending-up" size={14} color="#4A5568" /> Distância: {item.distancia || 'N/A'} km</Text>
        </View>
        <Text style={styles.detailText}><Feather name="truck" size={14} color="#4A5568" /> Veículo: {item.veiculo || 'N/A'}</Text>
        <Text style={styles.detailText}><Feather name="users" size={14} color="#4A5568" /> Lugares: {passageirosAtuais}/{item.lugaresDisponiveis || 'N/A'}
          {estaLotada && <Text style={styles.lotadaText}> (Lotada)</Text>}
        </Text>
        <Text style={styles.detailText}><Feather name="user" size={14} color="#4A5568" /> Motorista: {item.motoristaNome || 'Desconhecido'}</Text>
        <Text style={styles.statusText}><Feather name="info" size={14} color="#007bff" /> Status: {item.status || 'N/A'}</Text>

        {item.passageiros && item.passageiros.length > 0 && (
          <View style={styles.passengersContainer}>
            <Text style={styles.passengersTitle}>
              <Feather name="users" size={16} color="#4A5568" /> Passageiros nesta corrida:
            </Text>
            {item.passageiros.map((passenger, index) => (
              <Text key={passenger.uid || index} style={styles.passengerItem}>- {passenger.nome || 'Desconhecido'}</Text>
            ))}
          </View>
        )}
        {(!item.passageiros || item.passageiros.length === 0) && (
          <Text style={styles.noPassengersText}>Seja o primeiro passageiro!</Text>
        )}

        <TouchableOpacity
          style={[styles.acceptButton, estaLotada && styles.disabledButton]}
          onPress={() => handleAceitarCorrida(item)}
          disabled={estaLotada}
        >
          <Text style={styles.acceptButtonText}>
            {estaLotada ? 'Lotada' : 'Aceitar Corrida'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const ListHeader = useMemo(() => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Buscar Corrida</Text>

      {/* Filtro por Destino */}
      <Text style={styles.label}>Destino</Text>
      <View style={styles.inputContainer}>
        <Feather name="search" size={20} color="#805AD5" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Digite o destino para buscar"
          placeholderTextColor="#A0AEC0"
          value={destinoFiltro}
          onChangeText={handleDestinationFilterChange}
          onFocus={() => setShowDestinationSuggestions(destinoFiltro.length > 0)}
          onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 150)}
        />
      </View>
      {showDestinationSuggestions && filteredDestinationSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
            {filteredDestinationSuggestions.map(item => (
              <TouchableOpacity key={item.nome} style={styles.suggestionItem} onPress={() => selectDestinationFilter(item)}>
                <Text style={styles.suggestionText}>{item.nome}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Filtro por Data */}
      <Text style={styles.label}>Data</Text>
      <View style={styles.inputContainer}>
        <Feather name="calendar" size={20} color="#805AD5" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ex: DD/MM/AAAA"
          placeholderTextColor="#A0AEC0"
          value={dataFiltro}
          onChangeText={setDataFiltro}
        />
      </View>

      {/* Filtro por Horário */}
      <Text style={styles.label}>Horário</Text>
      <View style={styles.inputContainer}>
        <Feather name="clock" size={20} color="#805AD5" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ex: 15:30"
          placeholderTextColor="#A0AEC0"
          value={horarioFiltro}
          onChangeText={setHorarioFiltro}
        />
      </View>

      {/* Filtros de Valor */}
      <Text style={styles.label}>Valor (R$)</Text>
      <View style={styles.filterRow}>
        <View style={styles.inputContainerRow}>
          <Feather name="dollar-sign" size={20} color="#805AD5" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Min"
            placeholderTextColor="#A0AEC0"
            value={valorMinFiltro}
            onChangeText={setValorMinFiltro}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.separator}>até</Text>
        <View style={styles.inputContainerRow}>
          <Feather name="dollar-sign" size={20} color="#805AD5" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Max"
            placeholderTextColor="#A0AEC0"
            value={valorMaxFiltro}
            onChangeText={setValorMaxFiltro}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Filtros de Distância */}
      <Text style={styles.label}>Distância (km)</Text>
      <View style={styles.filterRow}>
        <View style={styles.inputContainerRow}>
          <Feather name="trending-up" size={20} color="#805AD5" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Min"
            placeholderTextColor="#A0AEC0"
            value={distanciaMinFiltro}
            onChangeText={setDistanciaMinFiltro}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.separator}>até</Text>
        <View style={styles.inputContainerRow}>
          <Feather name="trending-up" size={20} color="#805AD5" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Max"
            placeholderTextColor="#A0AEC0"
            value={distanciaMaxFiltro}
            onChangeText={setDistanciaMaxFiltro}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      {filteredCorridas.length > 0 && (
        <Text style={styles.resultTitle}>
          {destinoFiltro.trim() !== '' || dataFiltro.trim() !== '' || horarioFiltro.trim() !== '' || valorMinFiltro.trim() !== '' || valorMaxFiltro.trim() !== '' || distanciaMinFiltro.trim() !== '' || distanciaMaxFiltro.trim() !== ''
            ? 'Corridas Encontradas:' : 'Todas as Corridas Ativas:'}
        </Text>
      )}
    </View>
  ), [
    destinoFiltro,
    dataFiltro,
    horarioFiltro,
    valorMinFiltro,
    valorMaxFiltro,
    distanciaMinFiltro,
    distanciaMaxFiltro,
    showDestinationSuggestions,
    filteredDestinationSuggestions,
    filteredCorridas.length,
    handleDestinationFilterChange,
    selectDestinationFilter,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B46C1" />
            <Text style={styles.loadingText}>Carregando corridas...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCorridas}
            keyExtractor={(item) => item.id}
            renderItem={renderCorrida}
            contentContainerStyle={styles.listContentContainer}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={() => (
              <Text style={styles.noResultText}>
                {destinoFiltro.trim() === '' && dataFiltro.trim() === '' && horarioFiltro.trim() === ''
                  ? 'Nenhuma corrida ativa disponível no momento.'
                  : `Nenhuma corrida encontrada com os filtros selecionados.`}
              </Text>
            )}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 35,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: '#2D3748',
  },
  icon: {
    marginRight: 10,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: -15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: 200,
    zIndex: 1,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  suggestionText: {
    fontSize: 16,
    color: '#4A5568',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 20,
    marginTop: 20,
  },
  corridaItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  corridaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#4A5568',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007bff',
    marginTop: 5,
  },
  lotadaText: {
    color: '#E53E3E',
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#38A169',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#38A169',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#CBD5E0',
    shadowColor: 'transparent',
    elevation: 0,
  },
  noResultText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  passengersContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  passengersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4A5568',
  },
  passengerItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 5,
  },
  noPassengersText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#A0AEC0',
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputContainerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  separator: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#4A5568',
  },
});