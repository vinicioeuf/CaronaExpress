import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { db, auth } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function MinhasCorridas() {
  const [abaSelecionada, setAbaSelecionada] = useState('Passageiro');
  const [corridasPassageiro, setCorridasPassageiro] = useState([]);
  const [corridasMotorista, setCorridasMotorista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        setupFirestoreListeners(user.uid);
      } else {
        setUserId(null);
        setCorridasPassageiro([]);
        setCorridasMotorista([]);
        setLoading(false);
        Alert.alert('Erro', 'Você precisa estar logado para ver suas corridas.');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const setupFirestoreListeners = (currentUserId) => {
    if (!currentUserId) return;

    setLoading(true);

    const qPassageiro = query(
      collection(db, 'corridas'),
      where('passageiros', 'array-contains', currentUserId)
    );
    const unsubscribePassageiro = onSnapshot(qPassageiro, (snapshot) => {
      const corridas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCorridasPassageiro(corridas);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar corridas como passageiro:", error);
      Alert.alert('Erro', 'Não foi possível carregar suas corridas como passageiro.');
      setLoading(false);
    });

    const qMotorista = query(
      collection(db, 'corridas'),
      where('motorista', '==', currentUserId)
    );
    const unsubscribeMotorista = onSnapshot(qMotorista, (snapshot) => {
      const corridas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCorridasMotorista(corridas);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar corridas como motorista:", error);
      Alert.alert('Erro', 'Não foi possível carregar suas corridas como motorista.');
      setLoading(false);
    });

    return () => {
      unsubscribePassageiro();
      unsubscribeMotorista();
    };
  };

  const dados = abaSelecionada === 'Passageiro' ? corridasPassageiro : corridasMotorista;

  const renderCorrida = ({ item }) => {
    const passageirosAtuais = item.passageiros ? item.passageiros.length : 0;
    const estaLotada = passageirosAtuais >= item.lugaresDisponiveis;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          <Feather name="map-pin" size={18} color="#6B46C1" /> {item.origem} → {item.destino}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.detailText}>
            <Feather name="clock" size={14} color="#4A5568" /> {item.horario}
          </Text>
          <Text style={styles.statusText}>
            <Feather name="info" size={14} color="#007bff" /> Status: {item.status || 'N/A'}
          </Text>
        </View>
        <Text style={styles.detailText}>
          <Feather name="truck" size={14} color="#4A5568" /> Veículo: {item.veiculo || 'N/A'}
        </Text>
        <Text style={styles.detailText}>
          <Feather name="users" size={14} color="#4A5568" /> Lugares: {passageirosAtuais}/{item.lugaresDisponiveis || 'N/A'}
          {estaLotada && <Text style={styles.lotadaText}> (Lotada)</Text>}
        </Text>
        <Text style={styles.detailText}>
          <Feather name="dollar-sign" size={14} color="#38A169" /> Valor: R$ {item.valor ? item.valor.toFixed(2).replace('.', ',') : '0,00'}
        </Text>

        {/* Exibir passageiros apenas para a aba de motorista */}
        {abaSelecionada === 'Motorista' && item.passageiros && item.passageiros.length > 0 && (
          <View style={styles.passengersContainer}>
            <Text style={styles.passengersTitle}>
              <Feather name="users" size={16} color="#4A5568" /> Passageiros:
            </Text>
            {item.passageiros.map((passengerId, index) => (
              <Text key={index} style={styles.passengerItem}>- {passengerId}</Text>
            ))}
          </View>
        )}
        {abaSelecionada === 'Motorista' && (!item.passageiros || item.passageiros.length === 0) && (
          <Text style={styles.noPassengersText}>Nenhum passageiro ainda.</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Minhas Corridas</Text>

        <View style={styles.tabs}>
          {['Passageiro', 'Motorista'].map((aba) => (
            <Pressable
              key={aba}
              style={[
                styles.tabButton,
                abaSelecionada === aba && styles.tabSelected,
              ]}
              onPress={() => setAbaSelecionada(aba)}
            >
              <Text
                style={[
                  styles.tabText,
                  abaSelecionada === aba && styles.tabTextSelected,
                ]}
              >
                Como {aba}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B46C1" />
            <Text style={styles.loadingText}>Carregando corridas...</Text>
          </View>
        ) : (
          <FlatList
            data={dados}
            keyExtractor={(item) => item.id}
            renderItem={renderCorrida}
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{ marginTop: 10 }}
            ListEmptyComponent={() => (
              <Text style={styles.noCorridasText}>
                {abaSelecionada === 'Passageiro'
                  ? 'Você não aceitou nenhuma corrida ainda.'
                  : 'Você não ofereceu nenhuma corrida ainda.'}
              </Text>
            )}
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
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 35,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden', // Garante que o borderRadius funcione
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: '#6B46C1',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A5568',
  },
  tabTextSelected: {
    color: '#fff',
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  lotadaText: {
    color: '#E53E3E',
    fontWeight: 'bold',
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
  noCorridasText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 30,
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
    marginLeft: 5, // Pequeno recuo para os itens da lista
  },
  noPassengersText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#A0AEC0',
    marginTop: 8,
  },
});
