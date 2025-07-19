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
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import colors from '../../assets/theme/colors';

const { width } = Dimensions.get('window');

export default function Register({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaVizivel, setSenhaVizivel] = useState(true);

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
      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro ao registrar:', error);
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Bem-vindo(a)!</Text>
        <Text style={styles.subtitle}>Preencha os campos para se cadastrar</Text>

        <View style={styles.inputWrapper}>
          <FontAwesome name="user" size={18} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            placeholder="Nome"
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.inputWrapper}>
          <FontAwesome name="envelope" size={18} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            placeholder="E-mail"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <FontAwesome name="lock" size={18} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            placeholder="Senha"
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={senhaVizivel}
          />
          <Pressable onPress={toggleSenha}>
            <Ionicons name={senhaVizivel ? 'eye-off' : 'eye'} size={20} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.inputWrapper}>
          <FontAwesome name="lock" size={18} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            placeholder="Confirmar senha"
            style={styles.input}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry={senhaVizivel}
          />
          <Pressable onPress={toggleSenha}>
            <Ionicons name={senhaVizivel ? 'eye-off' : 'eye'} size={20} color={colors.primary} />
          </Pressable>
        </View>

        <Pressable onPress={handleRegister} style={{ width: '100%' }}>
          <LinearGradient colors={colors.gradientPrimary} style={styles.button}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.loginRedirect}>
          <Text style={styles.loginText}>Já tem uma conta?</Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Entrar</Text>
          </Pressable>
        </View>

        <Text style={styles.orText}>ou</Text>

        <View style={styles.socialIcons}>
          {['google', 'apple', 'facebook'].map((iconName) => (
            <View style={styles.socialButton} key={iconName}>
              <FontAwesome name={iconName} size={20} color="white" />
            </View>
          ))}
        </View>

        <Text style={styles.altText}>Entre de outra forma</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  box: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    marginTop: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  loginRedirect: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  orText: {
    marginVertical: 12,
    color: colors.mutedText,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  socialButton: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 12,
    marginHorizontal: 6,
  },
  altText: {
    fontSize: 13,
    color: colors.mutedText,
  },
});
