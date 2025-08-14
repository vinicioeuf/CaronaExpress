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
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function Home() {
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    async function loadUserData() {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name ? user.name.split(' ')[0] : 'Usuário'); 
          setUserPhoto(user.photoURL || null);
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        navigation.replace('Login');
      }
    }
    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão e logo */}
      <View style={styles.header}>
        <Pressable onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Feather name="menu" size={28} color="#000000ff" />
        </Pressable>
        <Image
  source={require('../../assets/logo.png')}
  style={styles.logo}
  resizeMode="contain"
  size={20}
/>

      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <Image
          source={{
            uri: userPhoto
              ? userPhoto
              : 'https://placehold.co/150x150/000000/FFFFFF?text=User',
          }}
          style={styles.avatar}
        />
        <Text style={styles.greeting}>Olá, {userName}!</Text>
        <Text style={styles.subtitle}>Vamos pegar a estrada?</Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.navigate('BuscarCorrida')}
        >
          <Text style={styles.mainButtonText}>Buscar Corrida</Text>
        </TouchableOpacity>
      </View>

      {/* Menu lateral */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.sideMenu}>
            <Text style={styles.menuHeader}>Navegação</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('MinhasCorridas');
              }}
            >
              <Feather name="list" size={20} color="#000000ff" />
              <Text style={styles.menuText}>Minhas Corridas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('OferecerCorrida');
              }}
            >
              <Feather name="plus-square" size={20} color="#000000ff" />
              <Text style={styles.menuText}>Oferecer Corrida</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Saldo');
              }}
            >
              <Feather name="dollar-sign" size={20} color="#000000ff" />
              <Text style={styles.menuText}>Perfil / Saldo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
              <AntDesign name="logout" size={20} color="#E53E3E" />
              <Text style={[styles.menuText, styles.logoutButtonText]}>Sair</Text>
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
    backgroundColor: '#fff', // Fundo branco
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  menuButton: {
    marginRight: 15,
    
  },
  logo: {
    width: 80,
    height: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#000', // Borda preta
    marginBottom: 25,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000', // Texto preto
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333', // Texto cinza escuro
    marginBottom: 40,
    textAlign: 'center',
  },
  mainButton: {
    width: '80%',
    height: 60,
    backgroundColor: '#000', // Botão preto
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mainButtonText: {
    color: '#fff', // Texto branco no botão
    fontSize: 20,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  sideMenu: {
    width: width * 0.75,
    height: '100%',
    backgroundColor: '#fff', // Menu branco
    paddingTop: Platform.OS === 'android' ? 60 : 80,
    paddingHorizontal: 25,
  },
  menuHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000', // Texto preto
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  menuText: {
    fontSize: 18,
    color: '#000', // Texto preto
    marginLeft: 15,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 30,
    borderBottomWidth: 0,
  },
  logoutButtonText: {
    color: '#E53E3E',
  },
});

