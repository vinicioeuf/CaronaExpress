import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MinhasCorridas() {
  const [abaSelecionada, setAbaSelecionada] = useState('Passageiro');

  const corridasPassageiro = [
    {
      id: '1',
      origem: 'Recife - PE',
      destino: 'Caruaru - PE',
      valor: 45,
      data: '01 de junho de 2030',
    },
    {
      id: '2',
      origem: 'Terra Nova - PE',
      destino: 'Salgueiro - PE',
      valor: 30,
      data: '05 de junho de 2030',
    },
  ];

  const corridasMotorista = [
    {
      id: '3',
      origem: 'Petrolina - PE',
      destino: 'Juazeiro - BA',
      valor: 20,
      data: '03 de maio de 2030',
    },
    {
      id: '4',
      origem: 'Olinda - PE',
      destino: 'Paulista - PE',
      valor: 15,
      data: '12 de abril de 2030',
    },
  ];

  const dados = abaSelecionada === 'Passageiro' ? corridasPassageiro : corridasMotorista;

  const renderCorrida = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.linha}>
        <Feather name="map-pin" size={16} color="#4F46E5" /> {item.origem} → {item.destino}
      </Text>
      <View style={styles.infoRow}>
        <Text style={styles.data}>📅 {item.data}</Text>
        <Text style={styles.valor}>💸 R$ {item.valor}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Minhas Corridas</Text>

      <View style={styles.abas}>
        {['Passageiro', 'Motorista'].map((aba) => (
          <Pressable
            key={aba}
            style={[
              styles.abaBotao,
              abaSelecionada === aba && styles.abaSelecionada,
            ]}
            onPress={() => setAbaSelecionada(aba)}
          >
            <Text
              style={[
                styles.abaTexto,
                abaSelecionada === aba && styles.abaTextoSelecionado,
              ]}
            >
              Como {aba}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={dados}
        keyExtractor={(item) => item.id}
        renderItem={renderCorrida}
        contentContainerStyle={{ paddingBottom: 20 }}
        style={{ marginTop: 10 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    padding: 50,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  abas: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  abaBotao: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  abaSelecionada: {
    backgroundColor: '#4F46E5',
  },
  abaTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  abaTextoSelecionado: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  linha: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4B5563',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  data: {
    fontSize: 14,
    color: '#6B7280',
  },
  valor: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
});
