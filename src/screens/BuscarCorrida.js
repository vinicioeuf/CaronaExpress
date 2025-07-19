// BuscarCorrida.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform, // 👈 Adicione isso aqui
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


const GOOGLE_API_KEY = 'AIzaSyAPE5zJ7tXFbJU0FMTNxBPO8Ubh1E2Y0F';

// Dados simulados de corridas disponíveis
const corridasDisponiveisSimuladas = [
  { id: '1', origem: 'Avenida Paulista, São Paulo', destino: 'Praça da Sé, São Paulo', horario: '15:00' },
  { id: '2', origem: 'Pinheiros, São Paulo', destino: 'Itaim Bibi, São Paulo', horario: '16:30' },
  { id: '3', origem: 'Centro, São Paulo', destino: 'Praça da Sé, São Paulo', horario: '17:00' },
];

export default function BuscarCorrida() {
  const [destinoFiltro, setDestinoFiltro] = useState(null);
  const [resultado, setResultado] = useState([]);

  function handleBuscar() {
    if (!destinoFiltro) {
      Alert.alert('Erro', 'Por favor, informe o destino para buscar.');
      return;
    }

    // Filtra corridas que tem o destino parecido (contém) com destinoFiltro.description
    const filtradas = corridasDisponiveisSimuladas.filter(corrida =>
      corrida.destino.toLowerCase().includes(destinoFiltro.description.toLowerCase())
    );

    if (filtradas.length === 0) {
      Alert.alert('Nenhuma corrida encontrada', 'Não há corridas disponíveis para este destino.');
    }

    setResultado(filtradas);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar Corrida</Text>

      <Text style={styles.label}>Destino</Text>
      <GooglePlacesAutocomplete
        placeholder="Digite o destino"
        onPress={(data, details = null) => {
          setDestinoFiltro(data);
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: 'pt',
          components: 'country:br',
        }}
        fetchDetails={true}
        styles={{
          textInput: styles.input,
          container: styles.autocompleteContainer,
          listView: styles.listView,
        }}
        debounce={200}
      />

      <TouchableOpacity style={styles.button} onPress={handleBuscar}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>

      <View style={styles.resultContainer}>
        {resultado.length > 0 && <Text style={styles.resultTitle}>Corridas Disponíveis:</Text>}

        <FlatList
          data={resultado}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.corridaItem}>
              <Text style={styles.corridaText}><Text style={styles.label}>Origem:</Text> {item.origem}</Text>
              <Text style={styles.corridaText}><Text style={styles.label}>Destino:</Text> {item.destino}</Text>
              <Text style={styles.corridaText}><Text style={styles.label}>Horário:</Text> {item.horario}</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.noResultText}>Nenhuma corrida encontrada para o destino informado.</Text>
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
  },
  autocompleteContainer: {
    flex: 0,
    marginBottom: 20,
    zIndex: 9999,
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
});
