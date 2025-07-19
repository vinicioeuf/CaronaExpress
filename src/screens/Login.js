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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import colors from '../../assets/theme/colors';
import { PasswordRecovery } from './PasswordRecovery';

const { width } = Dimensions.get('window');

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVizivel, setSenhaVizivel] = useState(true);
  const [abrirModal, setAbrirModal] = useState(false);

  const toggleSenha = () => {
    setSenhaVizivel(!senhaVizivel);
  };

  const handleLogin = async () => {
    try {
      // const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      // const user = userCredential.user;

      // await AsyncStorage.setItem('user', JSON.stringify({
      //   name: user.displayName || 'Usuário',
      //   email: user.email,
      //   uid: user.uid,
      //   photoURL: user.photoURL
      // }));

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
      }));

      navigation.replace('Home');
    } catch (error) {
      console.log('Erro no login com Google:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Bem-vindo(a)!</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>

        <View style={styles.inputWrapper}>
          <FontAwesome name="envelope" size={18} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <FontAwesome name="lock" size={18} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={senhaVizivel}
          />
          <Pressable onPress={toggleSenha}>
            <Ionicons
              name={senhaVizivel ? 'eye-off' : 'eye'}
              size={20}
              color={colors.primary}
            />
          </Pressable>
        </View>

        <Pressable onPress={() => setAbrirModal(true)}>
          <Text style={styles.forgotText}>Esqueceu a senha?</Text>
        </Pressable>

        <Modal visible={abrirModal} animationType="fade" transparent>
          <PasswordRecovery fecharModal={() => setAbrirModal(false)} />
        </Modal>

        <Pressable onPress={handleLogin} style={{ width: '100%' }}>
          <LinearGradient colors={colors.gradientPrimary} style={styles.button}>
            <Text style={styles.buttonText}>Entrar</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.registerWrapper}>
          <Text style={styles.registerText}>Novo por aqui?</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </Pressable>
        </View>

        <Text style={styles.orText}>ou</Text>

        <View style={styles.socialIcons}>
          {['google', 'apple', 'facebook'].map((iconName) => {
            const isGoogle = iconName === 'google';
            const Wrapper = isGoogle ? TouchableOpacity : View;
            const props = isGoogle ? { onPress: handleGoogleLogin } : {};

            return (
              <Wrapper key={iconName} {...props} style={styles.socialButton}>
                <FontAwesome name={iconName} size={20} color="white" />
              </Wrapper>
            );
          })}
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
  forgotText: {
    alignSelf: 'flex-end',
    marginTop: 8,
    color: colors.primary,
    fontSize: 13,
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
  registerWrapper: {
    flexDirection: 'row',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    marginRight: 4,
  },
  registerLink: {
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
