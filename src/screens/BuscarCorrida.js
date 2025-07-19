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

import { collection, getDocs, getFirestore, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { app, auth } from '../firebase/firebaseConfig';

const db = getFirestore(app);

export default function BuscarCorrida() {
  const [destinoFiltro, setDestinoFiltro] = useState('');
  const [resultado, setResultado] = useState([]);

  async function handleBuscar() {
    if (!destinoFiltro.trim()) {
      Alert.alert('Erro', 'Por favor, informe o destino para buscar.');
      return;
    }

    try {
      const corridasRef = collection(db, 'corridas');
      const q = query(corridasRef, where('destino', '==', destinoFiltro));
      const snapshot = await getDocs(q);

      const corridasEncontradas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (corridasEncontradas.length === 0) {
        Alert.alert('Nenhuma corrida encontrada', 'Não há corridas disponíveis para este destino.');
      }

      setResultado(corridasEncontradas);

    } catch (error) {
      Alert.alert('Erro', 'Erro ao buscar corridas. Tente novamente.');
      console.error('Erro ao buscar corridas:', error);
    }
  }

  async function handleAceitarCorrida(corrida) { // Recebe o objeto corrida completo
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para aceitar uma corrida.');
      return;
    }

    // Verifica se a corrida já está lotada
    const passageirosAtuais = corrida.passageiros ? corrida.passageiros.length : 0;
    if (passageirosAtuais >= corrida.lugaresDisponiveis) {
      Alert.alert('Corrida Lotada', 'Desculpe, esta corrida não tem mais lugares disponíveis.');
      return;
    }

    // Verifica se o usuário já é passageiro desta corrida
    if (corrida.passageiros && corrida.passageiros.includes(user.uid)) {
      Alert.alert('Atenção', 'Você já aceitou esta corrida.');
      return;
    }

    // Verifica se o usuário é o motorista da corrida
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
      // Recarrega a lista para refletir a mudança (lugares disponíveis, botão desabilitado)
      handleBuscar();

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
        <Text style={styles.corridaText}><Text style={styles.label}>Origem:</Text> {item.origem}</Text>
        <Text style={styles.corridaText}><Text style={styles.label}>Destino:</Text> {item.destino}</Text>
        <Text style={styles.corridaText}><Text style={styles.label}>Horário:</Text> {item.horario}</Text>
        <Text style={styles.corridaText}><Text style={styles.label}>Veículo:</Text> {item.veiculo}</Text>
        <Text style={styles.corridaText}>
          <Text style={styles.label}>Lugares:</Text> {passageirosAtuais}/{item.lugaresDisponiveis} {estaLotada && <Text style={styles.lotadaText}>(Lotada)</Text>}
        </Text>
        <Text style={styles.corridaText}><Text style={styles.label}>Valor:</Text> R$ {item.valor ? item.valor.toFixed(2).replace('.', ',') : '0,00'}</Text>

        {/* Botão Aceitar Corrida */}
        <TouchableOpacity
          style={[styles.acceptButton, estaLotada && styles.disabledButton]}
          onPress={() => handleAceitarCorrida(item)}
          disabled={estaLotada} // Desabilita o botão se a corrida estiver lotada
        >
          <Text style={styles.acceptButtonText}>
            {estaLotada ? 'Lotada' : 'Aceitar Corrida'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
        {resultado.length > 0 && <Text style={styles.resultTitle}>Corridas Disponíveis:</Text>}

        <FlatList
          data={resultado}
          keyExtractor={(item) => item.id}
          renderItem={renderCorrida}
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
  acceptButton: {
    backgroundColor: '#28a745',
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
  disabledButton: {
    backgroundColor: '#cccccc', // Cor para botão desabilitado
  },
  lotadaText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
