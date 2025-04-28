import React from 'react'; 
import { Text, StyleSheet, ImageBackground, View, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from 'react-native-vector-icons';
import LottieView from 'lottie-react-native';
import colors from '../../assets/theme/colors';
import BackgroundImage from '../../assets/appBackground.jpg';

const { width, height } = Dimensions.get('window');

export default function Main({navigation}) {
  return (
    <ImageBackground source={BackgroundImage} style={[styles.background, { width: width, height: height }]}>
      <View style={styles.container}>
        <Text style={styles.title}>Olá</Text>

        <View style={styles.animationContainer}>
          <LottieView 
            style={styles.animation}
            source={require('../../assets/appLottie.json')}
            autoPlay
            loop
          />
        </View>

        <Pressable onPress={() => navigation.navigate('Register')}>
          <LinearGradient colors={colors.gradientPrimary} style={styles.button}>
            <Text style={styles.buttonText}>Criar Conta</Text>
          </LinearGradient>
        </Pressable>

        <Pressable style={styles.button2}>
          <Text style={styles.buttonText}>Entrar</Text>
        </Pressable>

        <Text style={{ color: colors.mutedText }}>ou</Text>

        <View style={styles.iconsContainer}>
          {['google', 'apple', 'facebook'].map((iconName) => (
            <View style={styles.iconCircle} key={iconName}>
              <LinearGradient colors={colors.gradientPrimary} style={styles.iconCircleBackground}>
                <FontAwesome name={iconName} size={20} color="black" />
              </LinearGradient>
            </View>
          ))}
        </View>

        <Text style={{ color: colors.mutedText }}>Entre de outra forma</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    marginTop: 300,
    gap: 15,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 35,
    textAlign: 'center',
    color: colors.text,
  },
  button: {
    width: 250,
    height: 60,
    padding: 15,
    borderRadius: 10,
    textAlign: 'center',
  },
  button2: {
    borderWidth: 1,
    borderColor: colors.primary,
    width: 250,
    height: 60,
    padding: 15,
    borderRadius: 10,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 20,
    textAlign: 'center',
  },
  animationContainer: {
    width: 200, 
    height: 200, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  animation: {
    width: '100%', 
    height: '100%', 
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    width: 250,
    marginTop: 30,
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
});
