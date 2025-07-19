import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  TextInput,
} from 'react-native';

// Importações do Firebase Firestore e Auth
import { collection, getDocs, getFirestore, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { app, auth } from '../firebase/firebaseConfig'; // Importe 'auth' também

// Inicializa o Firestore
const db = getFirestore(app);

export default function BuscarCorrida() {
  const [destinoFiltro, setDestinoFiltro] = useState('');
  const [resultado, setResultado] = useState([]);

  // Função para buscar corridas com base no destino
  async function handleBuscar() {
    // Verifica se o campo de destino está vazio
    if (!destinoFiltro.trim()) {
      Alert.alert('Erro', 'Por favor, informe o destino para buscar.');
      return;
    }

    try {
      const corridasRef = collection(db, 'corridas');
      // Cria uma query para buscar corridas onde o campo 'destino' é igual ao 'destinoFiltro'
      const q = query(corridasRef, where('destino', '==', destinoFiltro));
      const snapshot = await getDocs(q);

      // Mapeia os documentos do snapshot para o formato desejado
      const corridasEncontradas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Exibe alerta se nenhuma corrida for encontrada
      if (corridasEncontradas.length === 0) {
        Alert.alert('Nenhuma corrida encontrada', 'Não há corridas disponíveis para este destino.');
      }

      // Atualiza o estado com as corridas filtradas
      setResultado(corridasEncontradas);

    } catch (error) {
      // Captura e exibe erros durante a busca
      Alert.alert('Erro', 'Erro ao buscar corridas. Tente novamente.');
      console.error('Erro ao buscar corridas:', error);
    }
  }

  // Função para aceitar uma corrida
  async function handleAceitarCorrida(corridaId) {
    const user = auth.currentUser; // Obtém o usuário autenticado

    // Verifica se o usuário está logado
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para aceitar uma corrida.');
      return;
    }

    try {
      // Cria uma referência para o documento da corrida específica
      const corridaRef = doc(db, 'corridas', corridaId);
      
      // Atualiza o documento adicionando o UID do passageiro ao array 'passageiros'
      // arrayUnion garante que o UID será adicionado apenas se ainda não existir no array
      await updateDoc(corridaRef, {
        passageiros: arrayUnion(user.uid)
      });

      Alert.alert('Sucesso', 'Corrida aceita com sucesso! Você foi adicionado como passageiro.');

      // Opcional: Recarrega a lista de corridas para refletir a mudança
      // Isso é útil para que o usuário veja o estado atualizado da corrida.
      handleBuscar(); 

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível aceitar a corrida.');
      console.error('Erro ao aceitar corrida:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar Corrida</Text>

      <Text style={styles.label}>Destino</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o destino"
        value={destinoFiltro}
        onChangeText={setDestinoFiltro}
      />

      <TouchableOpacity style={styles.button} onPress={handleBuscar}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>

      <View style={styles.resultContainer}>
        {/* Exibe o título "Corridas Disponíveis:" apenas se houver resultados */}
        {resultado.length > 0 && <Text style={styles.resultTitle}>Corridas Disponíveis:</Text>}

        <FlatList
          data={resultado}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.corridaItem}>
              <Text style={styles.corridaText}><Text style={styles.label}>Origem:</Text> {item.origem}</Text>
              <Text style={styles.corridaText}><Text style={styles.label}>Destino:</Text> {item.destino}</Text>
              <Text style={styles.corridaText}><Text style={styles.label}>Horário:</Text> {item.horario}</Text>
              
              {/* Botão Aceitar Corrida */}
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAceitarCorrida(item.id)} // Passa o ID da corrida para a função
              >
                <Text style={styles.acceptButtonText}>Aceitar Corrida</Text>
              </TouchableOpacity>
            </View>
          )}
          // Componente a ser renderizado quando a lista estiver vazia
          ListEmptyComponent={() => (
            <Text style={styles.noResultText}>
              {destinoFiltro.trim() && resultado.length === 0 ? 
                'Nenhuma corrida encontrada para o destino informado.' : 
                'Digite um destino e clique em "Buscar" para encontrar corridas.'}
            </Text>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 25,
    color: '#333',
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4B7BE5',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#222',
  },
  corridaItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  corridaText: {
    fontSize: 16,
    marginBottom: 4,
  },
  noResultText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#999',
  },
  // Estilos para o novo botão de aceitar
  acceptButton: {
    backgroundColor: '#28a745', // Verde para indicar aceitação
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});