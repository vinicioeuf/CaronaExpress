// Carona.js
import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../assets/theme/colors';
import ListaDeDados from '../componets/ListaDeDados';

export default function Carona() {
  const [filtroSelecionado, setFiltroSelecionado] = useState('Recente');

  const data = [
    {
      id: '1',
      origen: 'Terra Nova - PE',
      destino: 'Salgueiro - PE',
      valor: 30,
      data: '01 de junho de 2030'
    },
    {
      id: '2',
      origen: 'Recife - PE',
      destino: 'Caruaru - PE',
      valor: 45,
      data: '05 de junho de 2030'
    }
  ]

  return (
    <SafeAreaView style={{flex: 1}}> 
      <ScrollView style={styles.container}>
        <View style={styles.containerViewStyle}>
          <Text style={styles.text}>CaronaExpress ∙ Carona</Text>
          <TouchableOpacity>
            <LinearGradient colors={colors.gradientPrimary} style={styles.buttonStyle}>
              <MaterialCommunityIcons name='google-maps' size={20} color={colors.text}/> 
              <Text style={[styles.text, {color: colors.text}]}> Oferecer+</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.containerMinhasCorridas}>
          
          <View>
            <Text style={{color: "#737373", fontSize: 15, marginBottom: 10}}>Minhas Corridas: </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{flexDirection: "row", paddingRight: 16}}>
              {['Recente', '7 dias', '30 dias', 'Todo Período'].map((filtro) => (
                <Pressable 
                    key={filtro}
                    style={[
                      styles.backgroudBotaoStyle,
                      filtroSelecionado === filtro && { backgroundColor: colors.secondary }
                    ]}
                    onPress={() => setFiltroSelecionado(filtro)}
                    >
                    <Text style={{ color: filtroSelecionado === filtro ? '#fff' : '#000' }}>
                      {filtro}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>
          </View>

        </View>

        <View>
          <FlatList
          data={data}
          keyExtractor={((item) => item.id)}
          renderItem={({item}) => (
            <ListaDeDados origen={item.origen} destino={item.destino} valor={item.valor} data={item.data}/>
          )}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  text: { 
    fontSize: 15, 
    fontWeight: "bold"
  },
  containerViewStyle: {
    marginTop: 20,
    flexDirection: "row", 
    justifyContent: "space-around", 
    alignItems: "center",
    width: "100%", 
    height: "auto"
  }, 
  buttonStyle: {
    flexDirection: "row",
    borderRadius: 6, 
    padding: 8,
  }, 
  containerMinhasCorridas: {
    marginTop: 25, 
    alignItems: "flex-start",
    width: "90%", 
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
