import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
  KeyboardAvoidingView, // Adicionado para melhor UX com teclado
  Platform, // Para KeyboardAvoidingView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Mantém a importação de safe-area-context
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
// Removendo importação de colors, usando valores diretos

const { width } = Dimensions.get("window");

export function PasswordRecovery({ fecharModal }) {
  const [email, setEmail] = useState("");

  const onHandlePress = async () => {
    if (!email || !email.includes('@') || !email.includes('.')) { // Validação de e-mail mais robusta
      Alert.alert("Erro", "Por favor, insira um e-mail válido.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Sucesso", "E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      fecharModal();
    } catch (error) {
      console.error("Erro ao enviar e-mail de recuperação:", error); // Log do erro completo
      Alert.alert("Erro", "Não foi possível enviar o e-mail. Verifique o endereço ou sua conexão.");
    }
  };

  return (
    <KeyboardAvoidingView // Para ajustar a tela quando o teclado aparecer
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.closeButtonContainer}>
              <Pressable onPress={fecharModal} style={styles.closeButton}>
                <Ionicons name="close-circle-outline" size={30} color="#4A5568" /> {/* Ícone e cor ajustados */}
              </Pressable>
            </View>

            <Text style={styles.title}>Esqueceu sua senha?</Text>
            <Text style={styles.subtitle}>
              Informe seu e-mail cadastrado para receber as instruções de redefinição de senha.
            </Text>

            <View style={styles.inputWrapper}> {/* Novo wrapper para o input */}
              <Ionicons name="mail-outline" size={20} color="#4A5568" style={styles.inputIcon} /> {/* Ícone para e-mail */}
              <TextInput
                style={styles.input}
                placeholder="Seu e-mail"
                placeholderTextColor="#A0AEC0"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity onPress={onHandlePress} style={{ width: "100%", marginTop: 20 }}>
              <LinearGradient colors={['#000000ff', '#000000ff']} style={styles.button}>
                <Text style={styles.buttonText}>Redefinir Senha</Text> {/* Texto do botão ajustado */}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Overlay escuro para o modal
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalContent: {
    backgroundColor: '#FFFFFF', // Fundo branco
    borderRadius: 20, // Cantos bem arredondados
    padding: 30,
    width: width * 0.9, // 90% da largura da tela
    maxWidth: 400, // Limite máximo para telas grandes
    alignItems: 'center',
    shadowColor: '#000', // Sombra proeminente
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  closeButtonContainer: {
    width: '100%',
    alignItems: 'flex-end', // Alinha o botão de fechar à direita
    marginBottom: 10,
  },
  closeButton: {
    padding: 5, // Aumenta a área de toque
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22, // Espaçamento entre linhas
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
  button: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000ff',
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
});
