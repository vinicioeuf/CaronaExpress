import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  ActivityIndicator, // Para indicar carregamento
  Alert, // Para exibir mensagens de erro
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// Importações do Firebase
import { db, auth } from '../firebase/firebaseConfig'; // Certifique-se de que 'db' e 'auth' estão exportados corretamente
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function MinhasCorridas() {
  const [abaSelecionada, setAbaSelecionada] = useState('Passageiro');
  const [corridasPassageiro, setCorridasPassageiro] = useState([]);
  const [corridasMotorista, setCorridasMotorista] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [userId, setUserId] = useState(null); // Estado para armazenar o UID do usuário

  // Efeito para obter o UID do usuário e carregar as corridas
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        // Inicia a escuta das corridas somente após o UID estar disponível
        setupFirestoreListeners(user.uid);
      } else {
        setUserId(null);
        setCorridasPassageiro([]);
        setCorridasMotorista([]);
        setLoading(false); // Não há usuário, então não há carregamento de dados
        Alert.alert('Erro', 'Você precisa estar logado para ver suas corridas.');
      }
    });

    // Cleanup da inscrição de autenticação
    return () => unsubscribeAuth();
  }, []); // Executa apenas uma vez ao montar o componente

  // Função para configurar os listeners do Firestore
  const setupFirestoreListeners = (currentUserId) => {
    if (!currentUserId) return; // Garante que há um UID

    setLoading(true); // Inicia o carregamento

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
      setLoading(false); // Termina o carregamento após a primeira busca
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
      setLoading(false); // Termina o carregamento após a primeira busca
    }, (error) => {
      console.error("Erro ao buscar corridas como motorista:", error);
      Alert.alert('Erro', 'Não foi possível carregar suas corridas como motorista.');
      setLoading(false);
    });

    // Cleanup das inscrições do Firestore ao desmontar o componente
    return () => {
      unsubscribePassageiro();
      unsubscribeMotorista();
    };
  };

  // Seleciona os dados com base na aba selecionada
  const dados = abaSelecionada === 'Passageiro' ? corridasPassageiro : corridasMotorista;

  // Função para formatar a data
  const formatarData = (timestamp) => {
    if (!timestamp) return 'Data Indisponível';
    const date = timestamp.toDate(); // Converte o Timestamp do Firestore para objeto Date
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderCorrida = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.linha}>
        <Feather name="map-pin" size={16} color="#4F46E5" /> {item.origem} → {item.destino}
      </Text>
      <View style={styles.infoRow}>
        {/* Usando item.horario que já está no formato de string */}
        <Text style={styles.data}>⏰ {item.horario}</Text> 
        {/* Se você tiver um campo 'valor' no Firestore, pode exibi-lo aqui */}
        {/* <Text style={styles.valor}>💸 R$ {item.valor}</Text> */}
      </View>
    </View>
  );

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
    padding: 20, // Ajustado para ter um padding mais uniforme
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
    shadowColor: '#000', // Sombra para iOS
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
    alignItems: 'center', // Alinha verticalmente
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
});