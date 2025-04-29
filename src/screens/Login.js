import React, { useState } from 'react'; 
import { Text, StyleSheet, ImageBackground, View, Dimensions, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from 'react-native-vector-icons';
import colors from '../../assets/theme/colors';
import BackgroundImage from '../../assets/appBackground.jpg';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig'; // Ajuste o caminho se necessário
import { Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons"


const { width, height } = Dimensions.get('window');


export default function Login({navigation}) {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [animacaoOlho, setAnimacaoOlho] = useState("eye-off")
  const [senhaVizivel, setSenhaVizivel] = useState(true)


  async function handleLogin() {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      console.log('Login feito!', user.email);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', error.message);
    }
  }

  function vizibilidade(){

    const novoEstado = !senhaVizivel
    setSenhaVizivel(novoEstado)
    setAnimacaoOlho(novoEstado ? "eye-off" : "eye")
     
  }
  
    return (
        <SafeAreaProvider>
            <ImageBackground source={BackgroundImage} style={[styles.background, { width: width, height: height }]}>
            <SafeAreaView style={styles.container}>
                <View style={styles.viewLoginStyle}>
                    <Text style={{fontSize: 18, fontWeight: "bold"}}>Bem vindo de volta!</Text>
                    <Text style={{color: colors.mutedText}}>Preencha os campos abaixo, para fazer o seu login: </Text>
                    
                    <View style={styles.containerIconStyle}>
                        <FontAwesome size={20} style={styles.iconStyle} name="envelope"/>
                        <TextInput style={styles.inputStyle} 
                        placeholder='E-mail'  
                        onChangeText={setEmail}
                        value={email}
                        />
                    </View>
                    
                    <View style={styles.containerIconStyle}>
                        <FontAwesome size={20} style={styles.iconStyle} name="lock"/>
                        <TextInput 
                        style={styles.inputStyle} 
                        placeholder='Senha'
                        onChangeText={setSenha}
                        value={senha}
                        secureTextEntry={senhaVizivel}
                        />

                        <Pressable onPress={vizibilidade}>
                          <Ionicons name={animacaoOlho} size={20}/>
                        </Pressable>
                    </View>

                    <Pressable>
                        <Text style={{textAlign: "right", textDecorationLine: "underline"}}>Esqueceu sua senha?</Text>
                    </Pressable>
                </View>
                <View style={[{alignItems: "center"}, styles.viewLoginStyle]}>
                    
                    <View> 
                        <Pressable onPress={handleLogin}>
                            <LinearGradient colors={colors.gradientPrimary} style={styles.buttonStyle}>
                                <Text style={{fontSize: 15}}>Continuar</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>

                    <View style={{flex: 1, flexDirection:"row", gap: 5}}>
                        <Text>Nunca veio aqui?</Text>
                        <Pressable style={{textDecorationLine: "underline"} } onPress={() => navigation.navigate('Register')}>Cadastre-se</Pressable>
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
    gap: 8, 
  }, 
  inputStyle: {
    width: "100%", 
    height: 50,
    padding: 8, 
    backgroundColor: colors.inputBackGroud, 
    color: colors.text, 
    borderRadius: 8, 
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
