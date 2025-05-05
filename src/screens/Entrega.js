// Carona.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../assets/theme/colors';

export default function Entrega() {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.text}>Tela de Entrega</Text>
      </View>
      <View>

      </View>
      <View>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.gradientPrimary
  },
  text: { 
    fontSize: 20 
  },
});
