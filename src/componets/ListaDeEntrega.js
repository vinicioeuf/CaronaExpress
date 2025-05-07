import React, {useState} from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../assets/theme/colors";
import { EvilIcons } from "@expo/vector-icons";

export default function ListaDeEntrega({rua, numero, bairro, nome, telefone, entregar, filtro, destino}) {

    const formatadorDeMoeda = new Intl.NumberFormat("pt-BR", {
        style: "currency", 
        currency: "BRL",
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2,
    })

    const [vizibilidade, setVizibilidade] = useState(false)
    const [animacao, setAnimacao] = useState("plus")

    const mostrarDetalhes = () => {

        const novoEstado = !vizibilidade;
        setVizibilidade(novoEstado)
        setAnimacao(novoEstado ? "minus" : "plus")
            
    }

    return (
        <SafeAreaView style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <View style={styles.container}>

                <View>
                    
                    <View style={{
                        flexDirection: "row", 
                        alignItems: "center",
                        gap: 10,
                    }}>
                        <View style={[
                                styles.bolinha,
                                !entregar && filtro === "Receber" && styles.bolinhaVermelha
                            ]}
                        />
                        
                        <View>
                            <Text>{rua}, {numero}, {bairro}</Text>
                            <Text>{nome}, {telefone}</Text>
                        </View>

                    </View>
                   
                    <View > 
                        <View>
                            
                            {filtro === "Entregar" && entregar && (
                                <View 
                                    style={styles.layoutPressable}>
                                        <Pressable onPress={mostrarDetalhes}>
                                            <View style={
                                                {
                                                    flexDirection: "row", 
                                                    alignItems: "center", 
                                                    gap: 8,
                                                }
                                            }> 
                                                <EvilIcons 
                                                    name={animacao} 
                                                    color={colors.secondary} 
                                                    size={20}
                                                    />
                                                {vizibilidade ? (
                                                    <View>
                                                         <View style={
                                                                {
                                                                    flexDirection: "row", 
                                                                    justifyContent: "space-between",
                                                                    gap: 8,
                                                                }
                                                            }>
                                                                <View>
                                                                    <Text>
                                                                        <Text style={styles.label}>Rua:</Text> {destino[3]}{"\n"}
                                                                        <Text style={styles.label}>Bairro:</Text> {destino[4]}{"\n"}
                                                                    </Text>
                                                                </View>    

                                                                <View>
                                                                    <Text>
                                                                        <Text style={styles.label}>Cidade:</Text> {destino[5]}{"\n"}
                                                                        <Text style={styles.label}>CEP:</Text> {destino[6]}
                                                                    </Text>
                                                                </View>
                                                            
                                                        </View>

                                                        <View style={
                                                                {
                                                                    flexDirection: "row", 
                                                                    justifyContent: "space-between",
                                                                    marginTop: 8,
                                                                    gap: 8,
                                                                }
                                                            }>
                                                                <View>
                                                                    <Text>
                                                                        <Text style={styles.label}>Nome:</Text> {destino[0]}{"\n"}
                                                                        <Text style={styles.label}>N:</Text> {destino[1]}{"\n"}
                                                                    </Text>
                                                                </View>    

                                                                <View>
                                                                    <Text>
                                                                        <Text style={styles.label}>Tel.:</Text> {destino[2]}
                                                                    </Text>
                                                                </View>
                                                            
                                                        </View>
                                                    </View>
                                                ): 
                                                <Text 
                                                    style={styles.fontStyle}
                                                >
                                                Endereço de Entrega</Text>}  
                                            </View> 
                                        </Pressable>
                                </View>
                            )}

                        </View>
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
        width: "90%",
        borderRadius: 8,
        marginTop: 20,
    },
    bolinha: {
        width: 10, 
        height: 10, 
        borderRadius: "50%", 
        backgroundColor: colors.secondary
    },
    bolinhaVermelha: {
        backgroundColor: "red"
    }, 
    layoutPressable: {
        backgroundColor: colors.text, 
        width: "100%",
        paddingHorizontal: 12,
        paddingVertical: 15,
        borderRadius: 6, 
        marginTop: 15, 
    }, 
    fontStyle: {
        fontSize: 18, 
        fontWeight: "bold", 
    }, 
    label: {
        fontWeight: "bold", 
    }
})
