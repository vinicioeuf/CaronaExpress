import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { auth } from './src/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function App() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [feedback, setFeedback] = useState(''); 

  async function handleRegister() {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      console.log("Usuário registrado:", userCredential.user.email);
      setFeedback("Usuário registrado com sucesso!"); 
    } catch (error) {
      console.error("Erro ao registrar:", error);
      setFeedback("Erro: " + error.message); 
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Usuário</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <Button title="Registrar" onPress={handleRegister} />

      
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5
  },
  feedback: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#d9534f', 
  }
});
