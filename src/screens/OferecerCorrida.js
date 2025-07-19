import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  ScrollView,
  SafeAreaView // <--- Adicionado aqui
} from 'react-native';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';

export default function OferecerCorrida({ navigation }) {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [horario, setHorario] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [lugaresDisponiveis, setLugaresDisponiveis] = useState('');
  const [valor, setValor] = useState('');

  async function handleEnviar() {
    if (!origem || !destino || !horario || !veiculo || !lugaresDisponiveis || !valor) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const parsedLugares = parseInt(lugaresDisponiveis);
    const parsedValor = parseFloat(valor.replace(',', '.'));

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
        veiculo,
        lugaresDisponiveis: parsedLugares,
        valor: parsedValor,
        motorista: user.uid,
        passageiros: [],
        criadoEm: new Date(),
        status: 'Ativa'
      });

      Alert.alert('Sucesso', 'Corrida cadastrada com sucesso!');
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Oferecer Nova Corrida</Text>

          {/* Campo Origem */}
          <Text style={styles.label}>Origem</Text>
          <View style={styles.inputContainer}>
            <Feather name="map-pin" size={20} color="#805AD5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: Rua A, Cidade B"
              placeholderTextColor="#A0AEC0"
              value={origem}
              onChangeText={setOrigem}
            />
          </View>

          {/* Campo Destino */}
          <Text style={styles.label}>Destino</Text>
          <View style={styles.inputContainer}>
            <Feather name="flag" size={20} color="#805AD5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: Avenida X, Cidade Y"
              placeholderTextColor="#A0AEC0"
              value={destino}
              onChangeText={setDestino}
            />
          </View>

          {/* Campo Horário */}
          <Text style={styles.label}>Horário</Text>
          <View style={styles.inputContainer}>
            <Feather name="clock" size={20} color="#805AD5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: 15:30"
              placeholderTextColor="#A0AEC0"
              value={horario}
              onChangeText={setHorario}
              keyboardType="default"
            />
          </View>

          {/* Campo Veículo */}
          <Text style={styles.label}>Veículo</Text>
          <View style={styles.inputContainer}>
            <Feather name="truck" size={20} color="#805AD5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: Fiat Uno - Branco"
              placeholderTextColor="#A0AEC0"
              value={veiculo}
              onChangeText={setVeiculo}
            />
          </View>

          {/* Campo Lugares Disponíveis */}
          <Text style={styles.label}>Lugares Disponíveis</Text>
          <View style={styles.inputContainer}>
            <Feather name="users" size={20} color="#805AD5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: 3"
              placeholderTextColor="#A0AEC0"
              value={lugaresDisponiveis}
              onChangeText={setLugaresDisponiveis}
              keyboardType="numeric"
            />
          </View>

          {/* Campo Valor */}
          <Text style={styles.label}>Valor por Passageiro (R$)</Text>
          <View style={styles.inputContainer}>
            <Feather name="dollar-sign" size={20} color="#805AD5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: 25.50"
              placeholderTextColor="#A0AEC0"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleEnviar}>
            <Text style={styles.buttonText}>Oferecer Corrida</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingBottom: 20,
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
  button: {
    backgroundColor: '#6B46C1',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
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
});
