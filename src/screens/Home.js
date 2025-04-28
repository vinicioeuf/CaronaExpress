import React from 'react'; 
import { Text, StyleSheet, ImageBackground, View, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from 'react-native-vector-icons';
import LottieView from 'lottie-react-native';
import colors from '../../assets/theme/colors';
import BackgroundImage from '../../assets/appBackground.jpg';

const { width, height } = Dimensions.get('window');

export default function Home({navigation}) {
  return (
    <ImageBackground source={BackgroundImage} style={[styles.background, { width: width, height: height }]}>
      
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    marginTop: 200,
    gap: 7,
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
