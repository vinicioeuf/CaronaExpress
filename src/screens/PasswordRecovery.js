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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../assets/theme/colors";

const { width } = Dimensions.get("window");

export function PasswordRecovery({ fecharModal }) {
  const [email, setEmail] = useState("");

  const onHandlePress = async () => {
    if (!email) {
      Alert.alert("Erro", "Insira um e-mail válido.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Sucesso", "E-mail de recuperação enviado!");
      fecharModal();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar o e-mail. Verifique o endereço.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.modalBox}>
        <View style={styles.closeButtonContainer}>
          <Pressable onPress={fecharModal}>
            <Ionicons name="close-circle" size={28} color="red" />
          </Pressable>
        </View>

        <Text style={styles.title}>Esqueceu sua senha?</Text>
        <Text style={styles.subtitle}>
          Informe seu e-mail para redefinir sua senha.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Insira seu e-mail"
          placeholderTextColor={colors.mutedText}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TouchableOpacity onPress={onHandlePress} style={{ width: "100%" }}>
          <LinearGradient colors={colors.gradientPrimary} style={styles.button}>
            <Text style={styles.buttonText}>Recuperar Senha</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(24, 24, 24, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  closeButtonContainer: {
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 6,
    color: colors.textcolor3,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: colors.inputBackGroud || "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  button: {
    height: 44,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
});
