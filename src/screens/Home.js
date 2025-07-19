import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    async function loadUserData() {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name.split(' ')[0] || 'Motorista');
        setUserPhoto(user.photoURL || null);
      }
    }
    loadUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    await signOut(auth);
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão de menu */}
      <Pressable style={styles.menuIcon} onPress={() => setMenuVisible(true)}>
        <Feather name="menu" size={26} color="#333" />
      </Pressable>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <Image
          source={{
            uri: userPhoto
              ? userPhoto
              : 'https://alexandracriollo.com/wp-content/uploads/2020/12/10-cosas-que-revela-tu-foto-de-perfil-2-1.jpg',
          }}
          style={styles.avatar}
        />
        <Text style={styles.greeting}>Olá, {userName}!</Text>
        <Text style={styles.subtitle}>Vamos pegar a estrada?</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BuscarCorrida')}
        >
          <Text style={styles.buttonText}>Buscar Corrida</Text>
        </TouchableOpacity>
      </View>

      {/* Menu lateral */}
      <Modal transparent visible={menuVisible} animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.sideMenu}>
            <Text style={styles.menuHeader}>Menu</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('MinhasCorridas');
              }}
            >
              <Feather name="list" size={20} color="#444" />
              <Text style={styles.menuText}>Minhas Corridas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('OferecerCorrida');
              }}
            >
              <Feather name="send" size={20} color="#444" />
              <Text style={styles.menuText}>Oferecer Corrida</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Saldo');
              }}
            >
              <Feather name="user" size={20} color="#444" />
              <Text style={styles.menuText}>Perfil / Saldo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <AntDesign name="logout" size={20} color="red" />
              <Text style={[styles.menuText, { color: 'red' }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    position: 'relative',
  },
  menuIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 15,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  sideMenu: {
    width: 260,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 8,
  },
  menuHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 30,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    color: '#444',
  },
});
