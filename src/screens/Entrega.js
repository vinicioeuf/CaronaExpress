// Carona.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Entrega() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Entrega</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20 },
});
