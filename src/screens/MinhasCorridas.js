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

    // Listener para corridas como passageiro
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

    // Listener para corridas como motorista
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
        <Text style={styles.linha}>
          <Feather name="map-pin" size={16} color="#4F46E5" /> {item.origem} → {item.destino}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.data}>⏰ {item.horario}</Text>
          <Text style={styles.statusText}>Status: {item.status || 'N/A'}</Text>
        </View>
        <Text style={styles.detailText}><Text style={styles.label}>Veículo:</Text> {item.veiculo || 'N/A'}</Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Lugares:</Text> {passageirosAtuais}/{item.lugaresDisponiveis || 'N/A'} {estaLotada && <Text style={styles.lotadaText}>(Lotada)</Text>}
        </Text>
        <Text style={styles.detailText}><Text style={styles.label}>Valor:</Text> R$ {item.valor ? item.valor.toFixed(2).replace('.', ',') : '0,00'}</Text>

        {/* Exibir passageiros apenas para a aba de motorista */}
        {abaSelecionada === 'Motorista' && item.passageiros && item.passageiros.length > 0 && (
          <View style={styles.passengersContainer}>
            <Text style={styles.passengersTitle}>Passageiros:</Text>
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Minhas Corridas</Text>

      <View style={styles.abas}>
        {['Passageiro', 'Motorista'].map((aba) => (
          <Pressable
            key={aba}
            style={[
              styles.abaBotao,
              abaSelecionada === aba && styles.abaSelecionada,
            ]}
            onPress={() => setAbaSelecionada(aba)}
          >
            <Text
              style={[
                styles.abaTexto,
                abaSelecionada === aba && styles.abaTextoSelecionado,
              ]}
            >
              Como {aba}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  abas: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  abaBotao: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  abaSelecionada: {
    backgroundColor: '#4F46E5',
  },
  abaTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  abaTextoSelecionado: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  linha: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4B5563',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4, // Adicionado para espaçamento
  },
  data: {
    fontSize: 14,
    color: '#6B7280',
  },
  valor: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007bff',
  },
  detailText: { // Novo estilo para detalhes adicionais
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  lotadaText: {
    color: 'red',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  noCorridasText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  passengersContainer: { // Estilo para a lista de passageiros
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  passengersTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#4B5563',
  },
  passengerItem: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  noPassengersText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#999',
    marginTop: 5,
  },
});
