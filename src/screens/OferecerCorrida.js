import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ScrollView, SafeAreaView, FlatList } from 'react-native';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';
import SALGUEIRO_LOCATIONS from '../componets/salgueiroLocations.json'; // Importar o JSON

export default function OferecerCorrida({ navigation }) {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [horario, setHorario] = useState('');
  const [data, setData] = useState(''); // <--- NOVO ESTADO: para a data
  const [veiculo, setVeiculo] = useState('');
  const [lugaresDisponiveis, setLugaresDisponiveis] = useState('');
  const [valor, setValor] = useState('');

  // Estados para as sugestões de autocomplete
  const [filteredOriginSuggestions, setFilteredOriginSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [filteredDestinationSuggestions, setFilteredDestinationSuggestions] = useState([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Função de filtro para Origem
  const handleOriginChange = (text) => {
    setOrigem(text);
    if (text.length > 0) {
      const filtered = SALGUEIRO_LOCATIONS.filter(location =>
        location.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredOriginSuggestions(filtered);
      setShowOriginSuggestions(true);
    } else {
      setShowOriginSuggestions(false);
    }
  };

  // Função de seleção para Origem
  const selectOrigin = (location) => {
    setOrigem(location);
    setShowOriginSuggestions(false);
  };

  // Função de filtro para Destino
  const handleDestinationChange = (text) => {
    setDestino(text);
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
  const selectDestination = (location) => {
    setDestino(location);
    setShowDestinationSuggestions(false);
  };

  async function handleEnviar() {
    // Adicionada validação para o campo 'data'
    if (!origem || !destino || !horario || !data || !veiculo || !lugaresDisponiveis || !valor) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Validação para garantir que origem e destino estão na lista
    if (!SALGUEIRO_LOCATIONS.includes(origem)) {
      Alert.alert('Erro', 'Por favor, selecione uma Origem válida da lista de sugestões.');
      return;
    }
    if (!SALGUEIRO_LOCATIONS.includes(destino)) {
      Alert.alert('Erro', 'Por favor, selecione um Destino válido da lista de sugestões.');
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

      const motoristaNome = user.displayName || 'Motorista Desconhecido';

      await addDoc(collection(db, 'corridas'), {
        origem,
        destino,
        horario,
        data, // <--- NOVO CAMPO: Adicionando a data
        veiculo,
        lugaresDisponiveis: parsedLugares,
        valor: parsedValor,
        motoristaId: user.uid,
        motoristaNome: motoristaNome,
        passageiros: [],
        passengerUids: [],
        criadoEm: new Date(),
        status: 'Ativa'
      });

      Alert.alert('Sucesso', 'Corrida cadastrada com sucesso!');
      // Limpa os campos após o cadastro
      setOrigem('');
      setDestino('');
      setHorario('');
      setData(''); // <--- Limpa o campo de data
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

          {/* Campo Origem com Autocomplete */}
          <Text style={styles.label}>Origem</Text>
          <View style={styles.inputContainer}>
            <Feather name="map-pin" size={20} color="#805AD5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Digite a origem"
              placeholderTextColor="#A0AEC0"
              value={origem}
              onChangeText={handleOriginChange}
              onFocus={() => setShowOriginSuggestions(origem.length > 0)}
              onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 100)}
            />
          </View>
          {showOriginSuggestions && filteredOriginSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredOriginSuggestions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => selectOrigin(item)}>
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Campo Destino com Autocomplete */}
          <Text style={styles.label}>Destino</Text>
          <View style={styles.inputContainer}>
            <Feather name="flag" size={20} color="#805AD5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Digite o destino"
              placeholderTextColor="#A0AEC0"
              value={destino}
              onChangeText={handleDestinationChange}
              onFocus={() => setShowDestinationSuggestions(destino.length > 0)}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 100)}
            />
          </View>
          {showDestinationSuggestions && filteredDestinationSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredDestinationSuggestions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => selectDestination(item)}>
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Campo Data */}
          <Text style={styles.label}>Data da Corrida</Text> {/* <--- NOVO CAMPO */}
          <View style={styles.inputContainer}>
            <Feather name="calendar" size={20} color="#805AD5" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: DD/MM/AAAA"
              placeholderTextColor="#A0AEC0"
              value={data}
              onChangeText={setData}
              keyboardType="numeric" // Sugere teclado numérico
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
