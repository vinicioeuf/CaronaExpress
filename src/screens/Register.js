import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView, // Adicionado para rolável em telas menores
  SafeAreaView, // Certifique-se de que está importado de 'react-native' ou 'react-native-safe-area-context'
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
// Removendo importação de colors, usando valores diretos
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Register({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaVizivel, setSenhaVizivel] = useState(false); // Mudado para falso por padrão para ocultar senha

  const toggleSenha = () => setSenhaVizivel(!senhaVizivel);

  const handleRegister = async () => {
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: nome,
      });

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      navigation.navigate('Home'); // Navega para Home após o cadastro
    } catch (error) {
      console.error('Erro ao registrar:', error);
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Crie sua conta!</Text> {/* Título ajustado */}
            <Text style={styles.subtitle}>Preencha os campos para se cadastrar</Text>
          </View>

          {/* Campo Nome */}
          <View style={styles.inputWrapper}>
            <FontAwesome name="user" size={18} color="#4A5568" style={styles.inputIcon} />
            <TextInput
              placeholder="Nome completo" // Placeholder mais descritivo
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          {/* Campo E-mail */}
          <View style={styles.inputWrapper}>
            <FontAwesome name="envelope" size={18} color="#4A5568" style={styles.inputIcon} />
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
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
              placeholder="Senha"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!senhaVizivel}
            />
            <Pressable onPress={toggleSenha} style={styles.eyeIcon}>
              <Ionicons name={senhaVizivel ? 'eye-outline' : 'eye-off-outline'} size={20} color="#4A5568" />
            </Pressable>
          </View>

          {/* Campo Confirmar Senha */}
          <View style={styles.inputWrapper}>
            <FontAwesome name="lock" size={18} color="#4A5568" style={styles.inputIcon} />
            <TextInput
              placeholder="Confirmar senha"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!senhaVizivel} // Usa !senhaVizivel para ocultar/mostrar
            />
            <Pressable onPress={toggleSenha} style={styles.eyeIcon}>
              <Ionicons name={senhaVizivel ? 'eye-outline' : 'eye-off-outline'} size={20} color="#4A5568" />
            </Pressable>
          </View>

          {/* Botão Cadastrar */}
          <Pressable onPress={handleRegister} style={{ width: '100%', marginTop: 20 }}>
            <LinearGradient colors={['#805AD5', '#6B46C1']} style={styles.button}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </LinearGradient>
          </Pressable>

          {/* Redirecionamento para Login */}
          <View style={styles.loginRedirect}>
            <Text style={styles.loginText}>Já tem uma conta?</Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Entrar</Text>
            </Pressable>
          </View>

          <Text style={styles.orText}>ou</Text>

          {/* Botões de Login Social */}
          <View style={styles.socialIconsContainer}>
            <TouchableOpacity style={styles.socialButton}>
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

          <Text style={styles.altText}>Cadastre-se com sua conta Google</Text> {/* Texto ajustado */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC', // Cor de fundo suave
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
  loginRedirect: {
    flexDirection: 'row',
    marginTop: 25,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#4A5568',
    marginRight: 5,
  },
  loginLink: {
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
