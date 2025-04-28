import { Text, TextInput, Pressable, View } from "react-native-web"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase/firebaseConfig"
import React, { useState } from "react"

export function PasswordRecovery () {

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
        <View>

            <TextInput keyboardType="email-adresss" placeholder="email" id="email" onChange={onHandleChange}/>

            <Pressable onPress={onHandlePress}>
                <Text>Pecuperar Senha</Text>
            </Pressable>

        </View>
    )
}