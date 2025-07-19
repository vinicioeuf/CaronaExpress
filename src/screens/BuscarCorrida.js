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
  ActivityIndicator, // Para indicar carregamento
} from 'react-native';

import { collection, getFirestore, query, where, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { app, auth } from '../firebase/firebaseConfig';
import { Feather } from '@expo/vector-icons';

const db = getFirestore(app);

export default function BuscarCorrida() {
  const [destinoFiltro, setDestinoFiltro] = useState('');
  const [allCorridas, setAllCorridas] = useState([]); // Armazena todas as corridas ativas
  const [filteredCorridas, setFilteredCorridas] = useState([]); // Armazena as corridas filtradas para exibição
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // useEffect para carregar todas as corridas ativas uma vez e manter o listener em tempo real
  useEffect(() => {
    setLoading(true);
    const corridasRef = collection(db, 'corridas');
    // Consulta para pegar todas as corridas com status 'Ativa'
    const q = query(corridasRef, where('status', '==', 'Ativa'));

    // onSnapshot para escutar mudanças em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCorridas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllCorridas(fetchedCorridas); // Atualiza a lista completa
      setLoading(false); // Termina o carregamento
    }, (error) => {
      console.error("Erro ao carregar corridas:", error);
      Alert.alert('Erro', 'Não foi possível carregar as corridas disponíveis.');
      setLoading(false);
    });

    // Retorna a função de unsubscribe para limpar o listener quando o componente for desmontado
    return () => unsubscribe();
  }, []); // Executa apenas uma vez ao montar o componente

  // useEffect para filtrar as corridas sempre que 'allCorridas' ou 'destinoFiltro' mudar
  useEffect(() => {
    if (destinoFiltro.trim() === '') {
      setFilteredCorridas(allCorridas); // Se o filtro estiver vazio, mostra todas
    } else {
      const filtered = allCorridas.filter(corrida =>
        corrida.destino.toLowerCase().includes(destinoFiltro.toLowerCase())
      );
      setFilteredCorridas(filtered); // Filtra e atualiza a lista exibida
    }
  }, [destinoFiltro, allCorridas]); // Dependências: filtro e lista completa de corridas

  async function handleAceitarCorrida(corrida) {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para aceitar uma corrida.');
      return;
    }

    const passageirosAtuais = corrida.passageiros ? corrida.passageiros.length : 0;
    if (passageirosAtuais >= corrida.lugaresDisponiveis) {
      Alert.alert('Corrida Lotada', 'Desculpe, esta corrida não tem mais lugares disponíveis.');
      return;
    }

    if (corrida.passageiros && corrida.passageiros.includes(user.uid)) {
      Alert.alert('Atenção', 'Você já aceitou esta corrida.');
      return;
    }

    if (corrida.motorista === user.uid) {
      Alert.alert('Atenção', 'Você não pode aceitar sua própria corrida como passageiro.');
      return;
    }

    try {
      const corridaRef = doc(db, 'corridas', corrida.id);
      await updateDoc(corridaRef, {
        passageiros: arrayUnion(user.uid)
      });

      Alert.alert('Sucesso', 'Corrida aceita com sucesso! Você foi adicionado como passageiro.');
      // Não precisamos chamar handleBuscar() aqui, pois o onSnapshot já vai atualizar 'allCorridas'
      // e o useEffect de filtro vai reagir a essa mudança.

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível aceitar a corrida.');
      console.error('Erro ao aceitar corrida:', error);
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
          <Text style={styles.detailText}>
            <Feather name="clock" size={14} color="#4A5568" /> {item.horario}
          </Text>
          <Text style={styles.detailText}>
            <Feather name="dollar-sign" size={14} color="#38A169" /> R$ {item.valor ? item.valor.toFixed(2).replace('.', ',') : '0,00'}
          </Text>
        </View>
        <Text style={styles.detailText}>
          <Feather name="truck" size={14} color="#4A5568" /> Veículo: {item.veiculo || 'N/A'}
        </Text>
        <Text style={styles.detailText}>
          <Feather name="users" size={14} color="#4A5568" /> Lugares: {passageirosAtuais}/{item.lugaresDisponiveis || 'N/A'}
          {estaLotada && <Text style={styles.lotadaText}> (Lotada)</Text>}
        </Text>
        <Text style={styles.statusText}>
          <Feather name="info" size={14} color="#007bff" /> Status: {item.status || 'N/A'}
        </Text>

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
            onChangeText={setDestinoFiltro} // <--- Filtra em tempo real
          />
        </View>

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
              data={filteredCorridas} // Usa a lista filtrada
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
    marginBottom: 20,
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
  button: { // Removido do JSX, mas mantido aqui caso precise para outros fins
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
  buttonText: { // Removido do JSX
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
});
