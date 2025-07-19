// Saldo.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';

export default function Saldo() {
  const usuario = {
    nome: 'Victor Silva',
    email: 'victor.silva@email.com',
    saldo: 1234.56,
    deposito: 300.00,
    foto: 'https://i.pravatar.cc/150?img=12',
  };

  function handleDepositar() {
    Alert.alert('Depósito', 'Função de depósito ainda não implementada.');
  }

  function handleSacar() {
    Alert.alert('Saque', 'Função de saque ainda não implementada.');
  }

  return (
    <View style={styles.container}>

      {/* Informações do usuário */}
      <Text style={styles.sectionTitle}>Informações do Usuário</Text>
      <View style={styles.userInfo}>
        <Image source={{ uri: usuario.foto }} style={styles.avatar} />
        <View style={styles.infoList}>
          <Text style={styles.infoItem}>Nome: {usuario.nome}</Text>
          <Text style={styles.infoItem}>Email: {usuario.email}</Text>
        </View>
      </View>

      {/* Saldo */}
      <Text style={styles.sectionTitle}>Saldo</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoItem}>Saldo Atual:</Text>
        <Text style={styles.saldoValor}>R$ {usuario.saldo.toFixed(2).replace('.', ',')}</Text>
      </View>

      {/* Botões */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.depositButton]} onPress={handleDepositar}>
          <Text style={styles.buttonText}>Depositar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.withdrawButton]} onPress={handleSacar}>
          <Text style={styles.buttonText}>Sacar</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
    color: '#333',
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },

  infoList: {
    flex: 1,
  },

  infoItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
  },

  infoBox: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
  },

  saldoValor: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B7BE5',
    marginTop: 5,
  },

  depositoValor: {
    fontSize: 24,
    fontWeight: '600',
    color: '#33a853',
    marginTop: 5,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },

  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  depositButton: {
    backgroundColor: '#33a853',
  },

  withdrawButton: {
    backgroundColor: '#d9534f',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
