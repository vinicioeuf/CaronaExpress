import React, { useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Text, StyleSheet, ImageBackground, View, Dimensions, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from 'react-native-vector-icons';
import colors from '../../assets/theme/colors';
import BackgroundImage from '../../assets/appBackground.jpg';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [feedback, setFeedback] = useState(''); 
  
  async function handleRegister() {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: nome, 
      });
      console.log("Usuário registrado:", user.email, "Nome:", user.displayName);
      setFeedback("Usuário registrado com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar:", error);
      setFeedback("Erro: " + error.message);
    }
  }

  return (
    <SafeAreaProvider>
        <ImageBackground source={BackgroundImage} style={[styles.background, { width: width, height: height }]}>
        <SafeAreaView style={styles.container}>
            <View style={styles.viewLoginStyle}>
                <Text style={{fontSize: 18, fontWeight: "bold"}}>Bem-vindo(a)!</Text>
                <Text color={colors.mutedText}>Preencha os campos abaixo, para fazer o seu cadastro: </Text>
                
                <View style={styles.containerIconStyle}>
                  <FontAwesome size={20} style={styles.iconStyle} name="user"/>
                  <TextInput style={styles.inputStyle} onChangeText={setNome} value={nome} placeholder='Nome'/>
                </View>
                
                <View style={styles.containerIconStyle}>
                  <FontAwesome size={20} style={styles.iconStyle} name="envelope"/>
                  <TextInput style={styles.inputStyle} 
                    placeholder='E-mail'  
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"/>
                </View>

                <View style={styles.containerIconStyle}>
                  <FontAwesome size={20} style={styles.iconStyle} name="lock"/>
                  <TextInput 
                  style={styles.inputStyle} 
                  placeholder='Senha' 
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry/>
                </View>

                <View style={styles.containerIconStyle}>
                  <FontAwesome size={20} style={styles.iconStyle} name="lock"/>
                  <TextInput 
                  style={styles.inputStyle} 
                  placeholder='Confirmar senha'
                  />
                </View>
            </View>
            <View style={[{alignItems: "center", marginTop: 20}, styles.viewLoginStyle]}>
                
                <View>
                  <Pressable onPress={handleRegister}>
                      <LinearGradient colors={colors.gradientPrimary} style={styles.buttonStyle}>
                          <Text style={{fontSize: 15}}>Continuar</Text>
                      </LinearGradient>
                  </Pressable>
                </View>

                <View style={{flex: 1, flexDirection:"row", gap: 5}}>
                  <Text>Já tem uma conta?</Text>
                  <Pressable onPress={() => navigation.navigate('Login')}>
  <Text style={{textDecorationLine: "underline"}}>Entrar</Text>
</Pressable>

                </View>
                <View>
                  <Text style={{ color: colors.mutedText}}>ou</Text>
                </View>
                
                <View style={styles.iconsContainer}>
                  {['google', 'apple', 'facebook'].map((iconName) => (
                      <View style={styles.iconCircle} key={iconName}>
                        <LinearGradient colors={colors.gradientPrimary} style={styles.iconCircleBackground}>
                            <FontAwesome name={iconName} size={20} color="black" />
                        </LinearGradient>
                      </View>
                  ))}
                </View>

                <View>
                  <Text style={{ color: colors.mutedText }}>Entre de outra forma</Text>
                </View>

            </View>
        </SafeAreaView>
        </ImageBackground>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    marginTop: 200,
    gap: 15,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    width: 250,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleBackground: {
    width: 50,
    height: 50,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewLoginStyle: {
    gap: 6, 
  }, 
  inputStyle: {
    flex: 1,
    height: 50,
    padding: 8, 
    backgroundColor: colors.inputBackGroud, 
    color: colors.text, 
    borderRadius: 8, 
    textAlign: "left",
    alignItems: "center",
  }, 
  buttonStyle: {
    width: 200, 
    height: 40, 
    borderRadius: 8, 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 8,
  },
  containerIconStyle: {
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: colors.inputBackGroud,
    borderRadius: 8, 
    paddingHorizontal: 10, 
    height: 50, 
    marginVertical: 5
  }, 
  iconStyle: {
    marginRight: 10, 
  }, 
});