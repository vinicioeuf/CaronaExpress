import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, TextInput, Platform, Pressable} from 'react-native';
import Carona from './Carona';
import Entrega from './Entrega';
import Saldo from './Saldo';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'; 
import colors from '../../assets/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Carona');
  const auth = getAuth();
  const navigation = useNavigation();

  const renderScreen = () => {
    if (activeTab === 'Carona') return <Carona />;
    if (activeTab === 'Entrega') return <Entrega />;
    if (activeTab === 'Saldo') return <Saldo />;

  };
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState(null);
  useEffect(() => {
    async function loadUserData() {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || 'Usuário');
        setUserPhoto(user.photoURL || null); 
      }
    }
  
    loadUserData();
  }, []);
  
  async function handleLogout() {
    try {
      await AsyncStorage.removeItem('user');
      await signOut(auth); 
      navigation.replace('Login'); 
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
  

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho fixo */}
      <LinearGradient
      colors={colors.gradientPrimary} // colors.gradientPrimary (substitua com o seu)
      style={styles.header}
    >
      <View style={styles.topRow}>
        <View style={styles.profileSection}>
        <Image
          source={{
            uri: userPhoto
              ? userPhoto
              : 'https://alexandracriollo.com/wp-content/uploads/2020/12/10-cosas-que-revela-tu-foto-de-perfil-2-1.jpg'
          }}
          style={styles.avatar}
        />
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>Olá, {userName}</Text>
            <Text style={styles.welcome}>Para onde deseja ir hoje?</Text>
          </View>
        </View>

        <View style={styles.iconRow}>
          <View style={styles.iconBox}>
            <Feather name="bell" size={20} color={colors.secondary} />
          </View>
          <Pressable onPress={handleLogout}>
          <View style={styles.iconBox}>
            <MaterialIcons name="menu-open" size={24} color={colors.secondary} />
          </View>
          </Pressable>
          
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.locationIcon}>
          <Ionicons name="location-sharp" size={20} color="#ccc" />
        </View>
        <TextInput
          placeholder="Buscar carona..."
          placeholderTextColor="#ccc"
          style={styles.searchInput}
        />
      </View>
    </LinearGradient>

      {/* Conteúdo da aba atual */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation personalizado */}
      <LinearGradient
      colors={colors.gradientPrimary || ['#4c669f', '#3b5998']} // substitua pela sua definição
      style={styles.tabBar}
    >
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab('Carona')}
      >
        <Icon
          name="car" // ícone de carro
          size={24}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.tabText}>Corrida</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab('Entrega')}
      >
        <Icon
          name="package-variant-closed" // ícone de pacote
          size={24}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.tabText}>Entrega</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab('Saldo')}
      >
        <Icon
          name="currency-usd" // ícone de cifrão
          size={24}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.tabText}>Saldo</Text>
      </TouchableOpacity>
    </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 4,
    borderColor: 'white'
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  welcome: {
    color: 'white',
    fontSize: 14,
  },

  icon: {
    marginLeft: 16,
  },

  iconBox: {
    width: 40,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  searchWrapper: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '60%'
  },
  locationIcon: {
    marginRight: 8,
  },
  searchInput: {
    width: 200,
    flex: 1,
    color: '#333',
  },header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  welcome: {
    color: 'white',
    fontSize: 14,
  },
  iconRow: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 16,
  },
  searchWrapper: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#333',
  },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabButton: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 4,
  },
  tabText: {
    color: 'white',
    fontSize: 14,
  },
});

