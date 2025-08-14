// A localização do seu arquivo, ex: src/screens/OferecerCorrida.js

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, /*Alert,*/ Platform, ScrollView, SafeAreaView, FlatList
} from 'react-native';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';
import SALGUEIRO_LOCATIONS from '../componets/salgueiroLocations.json';
import CustomAlert from '../componets/CustomAlert'; // 1. IMPORTADO O COMPONENTE DE ALERTA

export default function OferecerCorrida({ navigation }) {
  // Estados para os nomes das localizações e os objetos completos com coordenadas
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [origemLocation, setOrigemLocation] = useState(null);
  const [destinoLocation, setDestinoLocation] = useState(null);

  // Novos estados para a distância e para os inputs formatados
  const [distancia, setDistancia] = useState(null);
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [valor, setValor] = useState('');

  // Outros estados do formulário
  const [veiculo, setVeiculo] = useState('');
  const [lugaresDisponiveis, setLugaresDisponiveis] = useState('');

  // Estados para as sugestões de autocomplete
  const [filteredOriginSuggestions, setFilteredOriginSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [filteredDestinationSuggestions, setFilteredDestinationSuggestions] = useState([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // 2. ESTADO PARA O ALERTA PERSONALIZADO
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    message: '',
    iconName: 'info',
    iconColor: '#6B46C1'
  });

  // 3. FUNÇÃO PARA EXIBIR O ALERTA
  const showAlert = (message, iconName = 'alert-circle', iconColor = '#DD6B20') => {
    setAlertConfig({ message, iconName, iconColor });
    setAlertVisible(true);
  };

  /**
   * Função para calcular a distância (sem alterações)
   */
  const calculateDistance = (loc1, loc2) => {
    const deltaX = loc2.x - loc1.x;
    const deltaY = loc2.y - loc1.y;
    const distanceInArbitraryUnits = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const kmPerUnit = 0.05;
    return (distanceInArbitraryUnits * kmPerUnit);
  };

  // Efeitos para cálculo de distância e valor (sem alterações)
  useEffect(() => {
    if (origemLocation && destinoLocation) {
      const calculatedDistance = calculateDistance(origemLocation, destinoLocation);
      setDistancia(calculatedDistance);
    } else {
      setDistancia(null);
    }
  }, [origemLocation, destinoLocation]);

  useEffect(() => {
    if (distancia !== null) {
      const GASOLINE_PRICE_PER_LITER = 6.85;
      const CAR_EFFICIENCY_KM_PER_L = 10;
      const PROFIT_MARGIN = 1.2;
      const totalCost = (distancia / CAR_EFFICIENCY_KM_PER_L) * GASOLINE_PRICE_PER_LITER * PROFIT_MARGIN;
      const formattedValue = totalCost.toFixed(2).replace('.', ',');
      setValor(formattedValue);
    }
  }, [distancia]);

  // Funções de autocomplete e formatação de inputs (sem alterações)
  const handleOriginChange = (text) => {
    setOrigem(text);
    if (text.length > 0) {
      const filtered = SALGUEIRO_LOCATIONS.filter(location =>
        location.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredOriginSuggestions(filtered);
      setShowOriginSuggestions(true);
    } else {
      setShowOriginSuggestions(false);
      setOrigemLocation(null);
    }
  };

  const selectOrigin = (location) => {
    setOrigem(location.nome);
    setOrigemLocation(location);
    setShowOriginSuggestions(false);
  };

  const handleDestinationChange = (text) => {
    setDestino(text);
    if (text.length > 0) {
      const filtered = SALGUEIRO_LOCATIONS.filter(location =>
        location.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDestinationSuggestions(filtered);
      setShowDestinationSuggestions(true);
    } else {
      setShowDestinationSuggestions(false);
      setDestinoLocation(null);
    }
  };

  const selectDestination = (location) => {
    setDestino(location.nome);
    setDestinoLocation(location);
    setShowDestinationSuggestions(false);
  };
  
  const handleValorChange = (text) => {
    let cleanedText = text.replace(/[^0-9,]/g, '');
    const parts = cleanedText.split(',');
    if (parts.length > 2) {
      cleanedText = `${parts[0]},${parts.slice(1).join('')}`;
    }
    setValor(cleanedText);
  };

  const handleDataChange = (text) => {
    let cleanedText = text.replace(/[^0-9]/g, '');
    if (cleanedText.length > 8) cleanedText = cleanedText.substring(0, 8);
    if (cleanedText.length >= 2) cleanedText = cleanedText.substring(0, 2) + '/' + cleanedText.substring(2);
    if (cleanedText.length >= 5) cleanedText = cleanedText.substring(0, 5) + '/' + cleanedText.substring(5);
    setData(cleanedText);
  };

  async function handleEnviar() {
    // 4. SUBSTITUIÇÃO DOS ALERTS POR showAlert
    if (!origem || !destino || !horario || !data || !veiculo || !lugaresDisponiveis || !valor) {
      showAlert('Por favor, preencha todos os campos.');
      return;
    }

    if (!origemLocation || !destinoLocation) {
      showAlert('Por favor, selecione uma Origem e um Destino válidos da lista.');
      return;
    }

    const parsedLugares = parseInt(lugaresDisponiveis);
    const parsedValor = parseFloat(valor.replace(',', '.'));

    if (isNaN(parsedLugares) || parsedLugares <= 0) {
      showAlert('Lugares disponíveis deve ser um número inteiro positivo.');
      return;
    }
    if (isNaN(parsedValor) || parsedValor <= 0) {
      showAlert('O valor deve ser um número positivo.');
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        showAlert('Usuário não autenticado. Faça login novamente.', 'user-x', '#E53E3E');
        return;
      }

      const motoristaNome = user.displayName || 'Motorista Desconhecido';

      await addDoc(collection(db, 'corridas'), {
        origem: origemLocation.nome,
        destino: destinoLocation.nome,
        distancia: distancia.toFixed(1),
        horario,
        data,
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

      // Alerta de sucesso
      showAlert('Corrida cadastrada com sucesso!', 'check-circle', '#38A169');
      
      // Limpa os campos do formulário
      setOrigem('');
      setDestino('');
      setOrigemLocation(null);
      setDestinoLocation(null);
      setDistancia(null);
      setHorario('');
      setData('');
      setVeiculo('');
      setLugaresDisponiveis('');
      setValor('');

      if (navigation) {
        navigation.navigate('MinhasCorridas');
      }

    } catch (error) {
      console.error('Erro ao cadastrar corrida:', error);
      showAlert('Não foi possível cadastrar a corrida. Tente novamente.', 'x-circle', '#E53E3E');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Oferecer Nova Corrida</Text>

          {/* Campo Origem com Autocomplete */}
          <Text style={styles.label}>Origem</Text>
          <View style={styles.inputContainer}>
            <Feather name="map-pin" size={20} color="#000" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Digite a origem"
              placeholderTextColor="#A0AEC0"
              value={origem}
              onChangeText={handleOriginChange}
              onFocus={() => setShowOriginSuggestions(origem.length > 0)}
              onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 150)}
            />
          </View>
          {showOriginSuggestions && filteredOriginSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredOriginSuggestions}
                keyExtractor={(item) => item.nome}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => selectOrigin(item)}>
                    <Text style={styles.suggestionText}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
                nestedScrollEnabled
              />
            </View>
          )}

          {/* Campo Destino com Autocomplete */}
          <Text style={styles.label}>Destino</Text>
          <View style={styles.inputContainer}>
            <Feather name="flag" size={20} color="#000" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Digite o destino"
              placeholderTextColor="#A0AEC0"
              value={destino}
              onChangeText={handleDestinationChange}
              onFocus={() => setShowDestinationSuggestions(destino.length > 0)}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 150)}
            />
          </View>
          {showDestinationSuggestions && filteredDestinationSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredDestinationSuggestions}
                keyExtractor={(item) => item.nome}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => selectDestination(item)}>
                    <Text style={styles.suggestionText}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
                nestedScrollEnabled
              />
            </View>
          )}
          
          {/* Exibe a distância calculada */}
          {distancia !== null && (
            <View style={styles.distanceContainer}>
              <Feather name="trending-up" size={18} color="#4A5568" />
              <Text style={styles.distanceText}>Distância calculada: {distancia.toFixed(1)} km</Text>
            </View>
          )}

          {/* Restante dos campos do formulário */}
          <Text style={styles.label}>Data da Corrida</Text>
          <View style={styles.inputContainer}>
            <Feather name="calendar" size={20} color="#000" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: DD/MM/AAAA"
              placeholderTextColor="#A0AEC0"
              value={data}
              onChangeText={handleDataChange}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.label}>Horário</Text>
          <View style={styles.inputContainer}>
            <Feather name="clock" size={20} color="#000" style={styles.icon} />
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
            <Feather name="truck" size={20} color="#000" style={styles.icon} />
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
            <Feather name="users" size={20} color="#000" style={styles.icon} />
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
            <Feather name="dollar-sign" size={20} color="#000" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: 25,50"
              placeholderTextColor="#A0AEC0"
              value={valor}
              onChangeText={handleValorChange}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleEnviar}>
            <Text style={styles.buttonText}>Oferecer Corrida</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 5. RENDERIZAÇÃO DO COMPONENTE DE ALERTA */}
      <CustomAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        message={alertConfig.message}
        iconName={alertConfig.iconName}
        iconColor={alertConfig.iconColor}
      />
    </SafeAreaView>
  );
}

// Estilos (sem alterações)
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
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: -15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: 150,
    zIndex: 1000,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  suggestionText: {
    fontSize: 16,
    color: '#4A5568',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#E6FFFA',
    borderRadius: 12,
    borderColor: '#B2F5EA',
    borderWidth: 1,
  },
  distanceText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2C5282',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
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