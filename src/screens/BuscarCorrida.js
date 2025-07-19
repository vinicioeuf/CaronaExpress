import React, { useState, useEffect } from 'react';
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
} from 'react-native';

import { collection, getFirestore, query, where, onSnapshot, doc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { app, auth, db } from '../firebase/firebaseConfig';
import { Feather } from '@expo/vector-icons';
import SALGUEIRO_LOCATIONS from '../componets/salgueiroLocations.json'; // Importar o JSON

export default function BuscarCorrida({ navigation }) {
  const [destinoFiltro, setDestinoFiltro] = useState('');
  const [allCorridas, setAllCorridas] = useState([]);
  const [filteredCorridas, setFilteredCorridas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para as sugestões de autocomplete
  const [filteredDestinationSuggestions, setFilteredDestinationSuggestions] = useState([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Função de filtro para Destino
  const handleDestinationFilterChange = (text) => {
    setDestinoFiltro(text);
    if (text.length > 0) {
      const filtered = SALGUEIRO_LOCATIONS.filter(location =>
        location.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDestinationSuggestions(filtered);
      setShowDestinationSuggestions(true);
    } else {
      setShowDestinationSuggestions(false);
    }
  };

  // Função de seleção para Destino
  const selectDestinationFilter = (location) => {
    setDestinoFiltro(location);
    setShowDestinationSuggestions(false);
  };

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

  useEffect(() => {
    if (destinoFiltro.trim() === '') {
      setFilteredCorridas(allCorridas);
    } else {
      const filtered = allCorridas.filter(corrida =>
        corrida.destino.toLowerCase().includes(destinoFiltro.toLowerCase())
      );
      setFilteredCorridas(filtered);
    }
  }, [destinoFiltro, allCorridas]);

  async function handleAceitarCorrida(corrida) {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para aceitar uma corrida.');
      return;
    }

    const isAlreadyPassenger = corrida.passageiros && corrida.passageiros.some(p => p.uid === user.uid);
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
          throw "Documentos não encontrados! Tente novamente.";
        }

        const passengerData = passengerDoc.data();
        const driverData = driverDoc.data();
        const corridaData = corridaDoc.data();

        const valorCorrida = corridaData.valor;
        const currentPassengerBalance = passengerData.balance || 0;
        const currentDriverBalance = driverData.balance || 0;

        if (currentPassengerBalance < valorCorrida) {
          throw "Saldo insuficiente para aceitar esta corrida.";
        }

        const currentPassageiros = corridaData.passageiros ? corridaData.passageiros.length : 0;
        if (currentPassageiros >= corridaData.lugaresDisponiveis) {
          throw "Corrida lotada enquanto você tentava aceitar.";
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
          <Text style={styles.detailText}><Feather name="clock" size={14} color="#4A5568" /> {item.horario}</Text>
          <Text style={styles.detailText}><Feather name="dollar-sign" size={14} color="#38A169" /> R$ {item.valor ? item.valor.toFixed(2).replace('.', ',') : '0,00'}</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Buscar Corrida</Text>

        <Text style={styles.label}>Destino</Text>
        <View style={styles.inputContainer}>
          <Feather name="search" size={20} color="#805AD5" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Digite o destino para buscar"
            placeholderTextColor="#A0AEC0"
            value={destinoFiltro}
            onChangeText={handleDestinationFilterChange} // <--- Usa a nova função de filtro
            onFocus={() => setShowDestinationSuggestions(destinoFiltro.length > 0)}
            onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 100)}
          />
        </View>
        {showDestinationSuggestions && filteredDestinationSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredDestinationSuggestions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => selectDestinationFilter(item)}>
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B46C1" />
            <Text style={styles.loadingText}>Carregando corridas...</Text>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            {filteredCorridas.length > 0 && destinoFiltro.trim() !== '' && <Text style={styles.resultTitle}>Corridas Encontradas:</Text>}
            {destinoFiltro.trim() === '' && allCorridas.length > 0 && <Text style={styles.resultTitle}>Todas as Corridas Ativas:</Text>}


            <FlatList
              data={filteredCorridas}
              keyExtractor={(item) => item.id}
              renderItem={renderCorrida}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={() => (
                <Text style={styles.noResultText}>
                  {destinoFiltro.trim() === ''
                    ? 'Nenhuma corrida ativa disponível no momento.'
                    : `Nenhuma corrida encontrada para "${destinoFiltro}".`}
                </Text>
              )}
            />
          </View>
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
    paddingVertical: 20,
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
    marginBottom: 20, // Ajustado para dar espaço às sugestões
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: '#2D3748',
  },
  // Estilos para as sugestões de autocomplete
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: -15, // Sobrepõe um pouco o input para parecer um dropdown
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: 200, // Limita a altura da lista de sugestões
    zIndex: 1, // Garante que a lista apareça acima de outros elementos
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC', // Linha divisória suave
  },
  suggestionText: {
    fontSize: 16,
    color: '#4A5568',
  },
  button: {
    backgroundColor: '#6B46C1',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  resultContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 20,
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
});
