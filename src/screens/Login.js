import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
// Adicionando a importação do AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { PasswordRecovery } from './PasswordRecovery';

const { width } = Dimensions.get('window');

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVizivel, setSenhaVizivel] = useState(false);
  const [abrirModal, setAbrirModal] = useState(false);

  const toggleSenha = () => {
    setSenhaVizivel(!senhaVizivel);
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await AsyncStorage.setItem('user', JSON.stringify({
        name: user.displayName || 'Usuário',
        email: user.email,
        uid: user.uid,
        photoURL: user.photoURL
      }));

      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erro no login', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await AsyncStorage.setItem('user', JSON.stringify({
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      }));

      Alert.alert('Sucesso', 'Login com Google realizado com sucesso!');
      navigation.replace('Home');
    } catch (error) {
      console.log('Erro no login com Google:', error);
      Alert.alert('Erro no Google Login', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Bem-vindo(a)!</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>
          </View>

          {/* Campo E-mail */}
          <View style={styles.inputWrapper}>
            <FontAwesome name="envelope" size={18} color="#4A5568" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#A0AEC0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Campo Senha */}
          <View style={styles.inputWrapper}>
            <FontAwesome name="lock" size={18} color="#4A5568" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#A0AEC0"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!senhaVizivel}
            />
            <Pressable onPress={toggleSenha} style={styles.eyeIcon}>
              <Ionicons
                name={senhaVizivel ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#4A5568"
              />
            </Pressable>
          </View>

          <Pressable onPress={() => setAbrirModal(true)} style={styles.forgotPasswordButton}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </Pressable>

          {/* Botão Entrar */}
          <Pressable onPress={handleLogin} style={{ width: '100%', marginTop: 20 }}>
            <LinearGradient colors={['#805AD5', '#6B46C1']} style={styles.button}>
              <Text style={styles.buttonText}>Entrar</Text>
            </LinearGradient>
          </Pressable>

          {/* Opção de Cadastro */}
          <View style={styles.registerWrapper}>
            <Text style={styles.registerText}>Novo por aqui?</Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </Pressable>
          </View>

          <Text style={styles.orText}>ou</Text>

          {/* Botões de Login Social */}
          <View style={styles.socialIconsContainer}>
            <TouchableOpacity onPress={handleGoogleLogin} style={styles.socialButton}>
              <FontAwesome name="google" size={24} color="#EA4335" />
            </TouchableOpacity>
            {/* Outros botões sociais (Apple, Facebook) se precisar implementar */}
            {/* <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="apple" size={24} color="#2D3748" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="facebook" size={24} color="#3b5998" />
            </TouchableOpacity> */}
          </View>

          <Text style={styles.altText}>Entre com sua conta Google</Text>
        </View>
      </ScrollView>

      {/* Modal de Recuperação de Senha */}
      <Modal visible={abrirModal} animationType="fade" transparent>
        <PasswordRecovery fecharModal={() => setAbrirModal(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.08,
    alignItems: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2D3748',
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: '#805AD5',
    fontWeight: '600',
  },
  button: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  registerWrapper: {
    flexDirection: 'row',
    marginTop: 25,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 15,
    color: '#4A5568',
    marginRight: 5,
  },
  registerLink: {
    fontSize: 15,
    color: '#805AD5',
    fontWeight: '700',
  },
  orText: {
    fontSize: 15,
    color: '#4A5568',
    marginVertical: 25,
    fontWeight: '500',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  altText: {
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
  },
});
