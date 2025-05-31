import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthLoading({ navigation }) {
  useEffect(() => {
    async function checkUser() {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        navigation.replace('Home'); // vai direto para Home
      } else {
        navigation.replace('Login'); // ou para Login
      }
    }

    checkUser();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
