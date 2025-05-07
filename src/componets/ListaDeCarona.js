import React, {useState} from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import colors from "../../assets/theme/colors";

export default function ListaDeCarona({origen, destino, data, valor}) {

    const[dadosViziveis, setDadosViziveis] = useState(true)
    const[animacaoOlho, setAnimacaoOlho] = useState("eye")

    async function vizibilidade(){
        try {
            const novoEstado = !dadosViziveis;
            setDadosViziveis(novoEstado)
            setAnimacaoOlho(novoEstado ? "eye" : "eye-off-outline")
            await AsyncStorage.setItem("senhaVizivel", novoEstado.toString())
        } catch (error) {
            console.log("Erro ao salvar estado ", error)
        }  
    }

    const formatadorDeMoeda = new Intl.NumberFormat("pt-BR", {
        style: "currency", 
        currency: "BRL",
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2,
    })

    return (
        <SafeAreaView style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <View style={styles.container}>
                <Pressable onPress={vizibilidade} style={{justifyContent: "center"}}>
                    <Ionicons style={styles.botaoOlho} name={animacaoOlho} color={"white"} size={20}/>
                </Pressable>
        
                <View style={styles.listContainer}>
                    <View style={{gap: 8}}>
                        <View style={{flexDirection: "row", gap: 4}}>
                            <Text>De:</Text>
                            {dadosViziveis ? (<Text style={styles.textStyle}>{origen}</Text>): 
                            <Text style={styles.barraBranca}></Text>}
                        </View>
                        <View style={{flexDirection: "row", gap: 4}}>
                            <Text>Para:</Text>
                            {dadosViziveis ? (<Text style={styles.textStyle}>{destino}</Text>): 
                            <Text style={styles.barraBranca}></Text>}
                        </View>
                    </View>

                    <View style={{alignItems:"flex-end", gap: 8}}>
                        {dadosViziveis ? (<Text style={styles.textStyle}>{formatadorDeMoeda.format(valor)}</Text>): 
                        <Text style={styles.barraBranca}></Text>}
                        {dadosViziveis ? (<Text style={[styles.textStyle, {fontStyle:"italic"}]}>{data}</Text>): 
                        <Text style={styles.barraBranca}></Text>} 
                    </View>

                </View>
                  
            </View>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.inputBackGroud,
        padding: 14, 
        width: "100%",
        borderRadius: 8,
        flexDirection: "row",
        marginTop: 20,
    },
    barraBranca: {
        backgroundColor: colors.text2,
        width: 200,
        borderRadius: 4, 
    },
    botaoOlho: {
        paddingRight: 2,
        paddingLeft: 2,
        paddingTop: 1, 
        paddingBottom: 1,
        backgroundColor: colors.secondary, 
        borderRadius: 2,
        marginRight: 8,
    }, 
    listContainer: {
        flexDirection: "row", 
        justifyContent: "space-between", 
        gap: 20, 
        width: "90%", 
        height: "auto"

    }, 
    textStyle: {
        color: colors.text2,
        fontWeight: "bold"
    }
})
