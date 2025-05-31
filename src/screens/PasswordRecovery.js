import { Text, TextInput, Pressable, View, StyleSheet, TouchableOpacity} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase/firebaseConfig"
import React, { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import colors from "../../assets/theme/colors";
import { LinearGradient } from 'expo-linear-gradient';

export function PasswordRecovery ({fecharModal}) {

    const [email, setEmail] = useState();

    const onHandleChange = (e) => {
        setEmail(e.target.value)
    }

    const onHandlePress = async () => {

        await sendPasswordResetEmail(auth, email).then(() => {
            alert('email de recuperação enviado!')
        }).catch((error) => {
            alert('email inválido!')
        })

    }

    return (
        <SafeAreaView style={styles.container}>
             
             <View>
                
                <LinearGradient colors={colors.gradientSeg} style={styles.areaModal}>
                    <View style={styles.containerSairStyle}>
                        <Pressable onPress={fecharModal}>
                            <Ionicons name="close-circle-sharp" color="red" size={30}/>
                        </Pressable>
                    </View>
                    
                    <View>
                        <Text style={{
                            fontWeight: "900",
                            fontSize: 20,
                            color: colors.textcolor3
                        }}>Esqueceu sua senha?</Text>
                    </View>

                    <View>
                        <Text style={styles.textStyle}>
                            Nos diga o seu email para podermos
                            redefinir sua senha
                        </Text>
                    </View>

                    <TextInput 
                        style={styles.textInputStyle} 
                        keyboardType="email-adresss" 
                        placeholder="Insira seu Email" 
                        id="email" 
                        onChange={onHandleChange}
                         placeholderTextColor={colors.mutedText}
                        />

                    <TouchableOpacity onPress={onHandlePress}>
                        <LinearGradient colors={colors.gradientPrimary} style={styles.buttonStyle}>
                            <Text style={{
                                color: colors.text, 
                                fontWeight: "bold", 
                                fontSize: 12
                            }}>Pecuperar Senha</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </LinearGradient>

             </View>
            

        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(24, 24, 24, 0.9)'
    },
    areaModal: {
        width: 325,
        height: 227,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
    },
    containerSairStyle: {
        alignItems: "flex-end",
        width: "100%",
        height: "auto",
        marginBottom: 5,
    }, 
    buttonStyle: {
        marginTop: 10,
        marginBottom: 10,
        width: 150, 
        height: 40, 
        borderRadius: 8, 
        justifyContent: "center", 
        alignItems: "center", 
        padding: 8,
        elevation: 5, 
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2}, 
        shadowOpacity: 0.25, 
        shadowRadius: 3.84, 
        overflow: "hidden",
  }, 
  textInputStyle: {
        padding: 8, 
        borderRadius: 8, 
        width: 300,
        height: "auto",
        backgroundColor: colors.background,
        marginBottom: 10,
  }, 
  textStyle: {
        textAlign: "left", 
        marginBottom: 20,
        fontSize: 12,
        color: colors.textcolor3,
  }
})