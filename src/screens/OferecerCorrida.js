import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// Certifique-se de que `navigation` é passado como uma prop para este componente
export default function OferecerCorrida({ navigation }) {
 const [origem, setOrigem] = useState('');
 const [destino, setDestino] = useState('');
 const [horario, setHorario] = useState('');

 async function handleEnviar() {
  if (!origem || !destino || !horario) {
   Alert.alert('Erro', 'Por favor, preencha todos os campos.');
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
    motorista: user.uid,
    criadoEm: new Date()
   });

   Alert.alert('Sucesso', 'Corrida cadastrada com sucesso!');
   
   // Limpa os campos após o cadastro
   setOrigem('');
   setDestino('');
   setHorario('');

   // Retorna para a tela 'MinhasCorridas'
   // Substitua 'MinhasCorridas' pelo nome exato da sua rota no navigator
   if (navigation) {
    navigation.navigate('MinhasCorridas'); 
   }

  } catch (error) {
   console.error('Erro ao cadastrar corrida:', error);
   Alert.alert('Erro', 'Não foi possível cadastrar a corrida.');
  }
 }

 return (
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