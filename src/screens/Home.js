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
  Dimensions, // Importar Dimensions para responsividade
  Platform, // <--- Adicionado: Importar Platform
  Alert, // <--- Adicionado: Importar Alert, pois é usado no handleLogout
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window'); // Obter largura da tela para responsividade

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
          // Pega apenas o primeiro nome ou "Usuário" se não houver nome
          setUserName(user.name ? user.name.split(' ')[0] : 'Usuário'); 
          setUserPhoto(user.photoURL || null);
        } else {
          // Se não houver dados no AsyncStorage, talvez o usuário não esteja logado
          // Redirecionar para a tela de Login
          navigation.replace('Login');
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário do AsyncStorage:", error);
        // Em caso de erro, também redirecionar para o login
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
      {/* Botão de menu */}
      <Pressable style={styles.menuButton} onPress={() => setMenuVisible(true)}>
        <Feather name="menu" size={28} color="#2D3748" /> {/* Cor do ícone ajustada */}
      </Pressable>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <Image
          source={{
            uri: userPhoto
              ? userPhoto
              : 'https://placehold.co/150x150/E2E8F0/4A5568?text=User', // URL de fallback corrigida
          }}
          style={styles.avatar}
        />
        <Text style={styles.greeting}>Olá, {userName}!</Text>
        <Text style={styles.subtitle}>Vamos pegar a estrada?</Text>

        <TouchableOpacity
          style={styles.mainButton} // Estilo de botão principal
          onPress={() => navigation.navigate('BuscarCorrida')}
        >
          <Text style={styles.mainButtonText}>Buscar Corrida</Text>
        </TouchableOpacity>
      </View>

      {/* Menu lateral */}
      <Modal transparent visible={menuVisible} animationType="fade"> {/* Animação fade */}
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.sideMenu}>
            <Text style={styles.menuHeader}>Navegação</Text> {/* Título do menu */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('MinhasCorridas');
              }}
            >
              <Feather name="list" size={20} color="#4A5568" />
              <Text style={styles.menuText}>Minhas Corridas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('OferecerCorrida');
              }}
            >
              <Feather name="plus-square" size={20} color="#4A5568" /> {/* Ícone ajustado */}
              <Text style={styles.menuText}>Oferecer Corrida</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Saldo');
              }}
            >
              <Feather name="dollar-sign" size={20} color="#4A5568" /> {/* Ícone ajustado */}
              <Text style={styles.menuText}>Perfil / Saldo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
              <AntDesign name="logout" size={20} color="#E53E3E" /> {/* Cor vermelha */}
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
    backgroundColor: '#F7FAFC', // Cor de fundo consistente
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Ajuste para Android
  },
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60, // Posição mais alta para o botão de menu
    left: 25,
    zIndex: 1, // Garante que o botão esteja acima de outros elementos
    padding: 10, // Área de toque maior
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
    borderRadius: 60, // Circular
    borderWidth: 4,
    borderColor: '#6B46C1', // Borda colorida
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#4A5568',
    marginBottom: 40,
    textAlign: 'center',
  },
  mainButton: {
    width: '80%', // Largura responsiva
    height: 60,
    backgroundColor: '#6B46C1', // Cor principal
    borderRadius: 15, // Cantos arredondados
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  offerRideButton: {
    backgroundColor: '#805AD5', // Cor secundária para o segundo botão
    shadowColor: '#805AD5',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Overlay escuro para o menu
    justifyContent: 'flex-start', // Alinha o menu ao topo
    alignItems: 'flex-start', // Alinha o menu à esquerda
  },
  sideMenu: {
    width: width * 0.75, // 75% da largura da tela
    height: '100%',
    backgroundColor: '#FFFFFF', // Fundo branco do menu
    paddingTop: Platform.OS === 'android' ? 60 : 80, // Ajuste para o topo do menu
    paddingHorizontal: 25,
    borderTopRightRadius: 20, // Cantos arredondados
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 }, // Sombra para a direita
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  menuHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuText: {
    fontSize: 18,
    color: '#4A5568',
    marginLeft: 15,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 30, // Espaçamento maior para o botão de sair
    borderBottomWidth: 0, // Remove a linha de baixo
  },
  logoutButtonText: {
    color: '#E53E3E', // Cor vermelha para o texto de sair
  },
});
