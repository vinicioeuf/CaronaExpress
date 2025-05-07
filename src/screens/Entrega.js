// Carona.js
import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../assets/theme/colors';
import { Entypo } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import { FlatList } from 'react-native-web';
import ListaDeEntrega from '../componets/ListaDeEntrega';

export default function Entrega() {

  const[valorSelecionado, setValorSelecionado] = useState("Entregar")

  const data = [
    {
      id: '1',
      rua: "Rua das Flores",
      numero: "123",
      bairro: "Centro",
      nome: "João Silva",
      telefone: "(11) 91234-5678",
      entregar: true,
      destino: ["Rafael Costa", "654", "(41) 96543-2109", "Travessa das Acácias", "Morada Verde", "Curitiba", "80540-280"],
    },
    {
      id: '2',
      rua: "Avenida Brasil",
      numero: "456",
      bairro: "Jardim América",
      nome: "Maria Oliveira",
      telefone: "(11) 99876-5432",
      entregar: true,
      destino: ["Fernanda Souza", "321", "(31) 97654-3210", "Rua Palmeiras", "Bela Vista", "São Paulo", "01432-000"],
    },
    {
      id: '3',
      rua: "Rua do Sol",
      numero: "789",
      bairro: "Vila Nova",
      nome: "Carlos Lima",
      telefone: "(21) 98765-4321",
      entregar: false,
    },
    {
      id: '4',
      rua: "Rua Palmeiras",
      numero: "321",
      bairro: "Bela Vista",
      nome: "Fernanda Souza",
      telefone: "(31) 97654-3210",
      entregar: false,
    },
    {
      id: '5',
      rua: "Travessa das Acácias",
      numero: "654",
      bairro: "Morada Verde",
      nome: "Rafael Costa",
      telefone: "(41) 96543-2109",
      entregar: true,
      destino: ["João Silva", "123", "(11) 91234-5678", "Rua das Flores", "Centro", "São Paulo", "01001-000"],
    },
  ];
  

  return (
    <SafeAreaView style={{flex: 1}}>

     <View style={styles.containerViewStyle}>
          <Text style={styles.text}>CaronaExpress ∙ Entrega</Text>
          <TouchableOpacity>
            <LinearGradient colors={colors.gradientPrimary} style={styles.buttonStyle}>
              <Entypo name='box' size={20} color={colors.text}/> 
              <Text style={[styles.text, {color: colors.text}]}> Levar Pacote</Text>
            </LinearGradient>
          </TouchableOpacity>
      </View>
      
      <View style={
        {flexDirection: 'row', 
        width: "90%",
        height: "auto",
        marginLeft: 20}
        }>
        {["Entregar", "Receber"].map((valor) =>(
          <Pressable
            key={valor}
            style={[
              styles.backgroudBotaoStyle,
              valorSelecionado === valor && 
              { backgroundColor: valor === "Receber" ? colors.error : colors.secondary}
            ]}
            onPress={() => setValorSelecionado(valor)}
          >
            <Text
            style={{color: valorSelecionado === valor ? colors.text : colors.text2}}>
              {valor}
            </Text>
          </Pressable>
        ))}
      </View>

      <View>
        <FlatList
          data={data.filter((item) =>{
            return (valorSelecionado === "Entregar" && item.entregar) ||
                   (valorSelecionado === "Receber" && !item.entregar)
          })}
          keyExtractor={((item) => item.id)}
          renderItem={({item}) => (
            <ListaDeEntrega 
            rua={item.rua}
            bairro={item.bairro}
            entregar={item.entregar}
            nome={item.nome}
            numero={item.numero}
            telefone={item.telefone}
            filtro={valorSelecionado}
            destino={item.destino}/>
          )}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.gradientPrimary
  },
  text: { 
    fontSize: 15, 
    fontWeight: "bold"
  },
  buttonStyle: {
    flexDirection: "row",
    borderRadius: 6, 
    padding: 8,
  }, 
  containerViewStyle: {
    marginTop: 20,
    flexDirection: "row", 
    justifyContent: "space-around", 
    alignItems: "center",
    width: "100%", 
    height: "auto"
  },
  backgroudBotaoStyle: {
    width: 100,
    height: 35,
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center"
  }
});
