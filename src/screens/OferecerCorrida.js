// OferecerCorrida.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_API_KEY = 'AIzaSyAPE5zJ7tXFbJU0FMTNxBPO8Ubh1E2Y0F';

export default function OferecerCorrida() {
  const [origem, setOrigem] = useState(null);
  const [destino, setDestino] = useState(null);
  const [horario, setHorario] = useState('');

  function handleEnviar() {
    if (!origem || !destino || !horario) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    Alert.alert('Corrida Oferecida', `Origem: ${origem.description}\nDestino: ${destino.description}\nHorário: ${horario}`);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oferecer Corrida</Text>

      <Text style={styles.label}>Origem</Text>
      <GooglePlacesAutocomplete
        placeholder="Digite a origem"
        onPress={(data, details = null) => {
          setOrigem(data);
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

      <Text style={styles.label}>Destino</Text>
      <GooglePlacesAutocomplete
        placeholder="Digite o destino"
        onPress={(data, details = null) => {
          setDestino(data);
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

      <Text style={styles.label}>Horário</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 15:30"
        value={horario}
        onChangeText={setHorario}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleEnviar}>
        <Text style={styles.buttonText}>Oferecer Corrida</Text>
      </TouchableOpacity>
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
  },
  autocompleteContainer: {
    flex: 0,
    marginBottom: 20,
    zIndex: 9999, // importante para aparecer sobre outros elementos
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5, // sombra Android
    shadowColor: '#000', // sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
