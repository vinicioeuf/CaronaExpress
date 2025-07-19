import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function OferecerCorrida({ navigation }) {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [horario, setHorario] = useState('');
  const [veiculo, setVeiculo] = useState(''); // Novo estado para veículo
  const [lugaresDisponiveis, setLugaresDisponiveis] = useState(''); // Novo estado para lugares
  const [valor, setValor] = useState(''); // Novo estado para valor

  async function handleEnviar() {
    // Validação de campos obrigatórios
    if (!origem || !destino || !horario || !veiculo || !lugaresDisponiveis || !valor) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Validação de números
    const parsedLugares = parseInt(lugaresDisponiveis);
    const parsedValor = parseFloat(valor.replace(',', '.')); // Permite vírgula como separador decimal

    if (isNaN(parsedLugares) || parsedLugares <= 0) {
      Alert.alert('Erro', 'Lugares disponíveis deve ser um número inteiro positivo.');
      return;
    }
    if (isNaN(parsedValor) || parsedValor <= 0) {
      Alert.alert('Erro', 'Valor deve ser um número positivo.');
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      await addDoc(collection(db, 'corridas'), {
        origem,
        destino,
        horario,
        veiculo, // Adicionando veículo
        lugaresDisponiveis: parsedLugares, // Adicionando lugares (como número)
        valor: parsedValor, // Adicionando valor (como número)
        motorista: user.uid,
        passageiros: [], // Inicializa o array de passageiros vazio
        criadoEm: new Date(),
        status: 'Ativa'
      });

      Alert.alert('Sucesso', 'Corrida cadastrada com sucesso!');
      // Limpa os campos após o cadastro
      setOrigem('');
      setDestino('');
      setHorario('');
      setVeiculo('');
      setLugaresDisponiveis('');
      setValor('');

      if (navigation) {
        navigation.navigate('MinhasCorridas');
      }

    } catch (error) {
      console.error('Erro ao cadastrar corrida:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar a corrida.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Oferecer Corrida</Text>

        <Text style={styles.label}>Origem</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a origem"
          value={origem}
          onChangeText={setOrigem}
        />

        <Text style={styles.label}>Destino</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o destino"
          value={destino}
          onChangeText={setDestino}
        />

        <Text style={styles.label}>Horário</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 15:30"
          value={horario}
          onChangeText={setHorario}
          keyboardType="default" // Pode ser 'numeric' se for só hora, mas 'default' para 15:30
        />

        <Text style={styles.label}>Veículo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Fiat Uno - Branco"
          value={veiculo}
          onChangeText={setVeiculo}
        />

        <Text style={styles.label}>Lugares Disponíveis</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 3"
          value={lugaresDisponiveis}
          onChangeText={setLugaresDisponiveis}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Valor por Passageiro (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 25.50"
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleEnviar}>
          <Text style={styles.buttonText}>Oferecer Corrida</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20, // Garante que o conteúdo não fique colado na parte inferior
  },
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4B7BE5',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
