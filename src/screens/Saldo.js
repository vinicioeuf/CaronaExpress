import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView, // Certifique-se de que está importado
  ScrollView, // Para permitir rolagem
  TextInput, // Para os novos campos de valor
  Platform, // Para estilos específicos de plataforma
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons'; // Importando ícones

// Importações do Firebase Auth e Firestore (se necessário para dados reais)
// import { auth, db } from '../firebase/firebaseConfig';
// import { doc, getDoc } from 'firebase/firestore';

export default function Saldo() {
  // Dados mockados do usuário. Em um aplicativo real, você buscaria isso do Firebase Auth e Firestore.
  const [usuario, setUsuario] = useState({
    nome: 'Victor Silva',
    email: 'victor.silva@email.com',
    saldo: 1234.56,
    foto: 'https://i.pravatar.cc/150?img=12', // Exemplo de URL de imagem de avatar
  });

  const [depositoValor, setDepositoValor] = useState(''); // Estado para o valor do depósito
  const [saqueValor, setSaqueValor] = useState('');     // Estado para o valor do saque

  // Exemplo de como você buscaria dados reais (descomente e adapte se for usar)
  /*
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Exemplo: buscar perfil de usuário de uma coleção 'users' no Firestore
        // const userDocRef = doc(db, 'users', currentUser.uid);
        // const userDocSnap = await getDoc(userDocRef);
        // if (userDocSnap.exists()) {
        //   setUsuario({
        //     ...usuario, // Mantém dados mockados se não houver no Firestore
        //     nome: userDocSnap.data().displayName || currentUser.displayName,
        //     email: currentUser.email,
        //     saldo: userDocSnap.data().saldo || 0,
        //     foto: currentUser.photoURL || 'https://i.pravatar.cc/150?img=avatar-default',
        //   });
        // } else {
          setUsuario({
            ...usuario,
            nome: currentUser.displayName || 'Usuário',
            email: currentUser.email,
            foto: currentUser.photoURL || 'https://i.pravatar.cc/150?img=avatar-default',
          });
        // }
      }
    };
    fetchUserData();
  }, []);
  */

  function handleDepositar() {
    const valor = parseFloat(depositoValor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor de depósito válido.');
      return;
    }
    // Lógica de depósito (ainda não implementada)
    Alert.alert('Depósito', `Função de depósito de R$ ${valor.toFixed(2).replace('.', ',')} ainda não implementada.`);
    setDepositoValor(''); // Limpa o campo
  }

  function handleSacar() {
    const valor = parseFloat(saqueValor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor de saque válido.');
      return;
    }
    // Lógica de saque (ainda não implementada)
    Alert.alert('Saque', `Função de saque de R$ ${valor.toFixed(2).replace('.', ',')} ainda não implementada.`);
    setSaqueValor(''); // Limpa o campo
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.headerTitle}>Meu Perfil e Saldo</Text>

          {/* Informações do usuário */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informações do Usuário</Text>
            <View style={styles.userInfo}>
              <Image source={{ uri: usuario.foto }} style={styles.avatar} />
              <View style={styles.infoList}>
                <Text style={styles.infoItem}>
                  <Feather name="user" size={16} color="#4A5568" /> Nome: {usuario.nome}
                </Text>
                <Text style={styles.infoItem}>
                  <Feather name="mail" size={16} color="#4A5568" /> Email: {usuario.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Saldo */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saldo Atual</Text>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Seu Saldo:</Text>
              <Text style={styles.balanceValue}>R$ {usuario.saldo.toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>

          {/* Seção de Depósito */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Depositar</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="money" size={20} color="#38A169" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Valor do depósito (R$)"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                value={depositoValor}
                onChangeText={setDepositoValor}
              />
            </View>
            <TouchableOpacity style={[styles.button, styles.depositButton]} onPress={handleDepositar}>
              <Text style={styles.buttonText}>Depositar</Text>
            </TouchableOpacity>
          </View>

          {/* Seção de Saque */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sacar</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="bank" size={20} color="#E53E3E" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Valor do saque (R$)"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                value={saqueValor}
                onChangeText={setSaqueValor}
              />
            </View>
            <TouchableOpacity style={[styles.button, styles.withdrawButton]} onPress={handleSacar}>
              <Text style={styles.buttonText}>Sacar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC', // Cor de fundo suave
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25, // Padding lateral consistente
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF', // Fundo branco para cards
    borderRadius: 15, // Cantos arredondados
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000', // Sombra sutil
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0', // Linha divisória
    paddingBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40, // Avatar circular
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#6B46C1', // Borda colorida
  },
  infoList: {
    flex: 1,
  },
  infoItem: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 5,
    flexDirection: 'row', // Para alinhar ícone e texto
    alignItems: 'center',
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  balanceLabel: {
    fontSize: 18,
    color: '#4A5568',
    fontWeight: '500',
  },
  saldoValor: {
    fontSize: 24,
    fontWeight: '700',
    color: '#38A169', // Verde para saldo positivo
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC', // Fundo mais claro para inputs dentro de cards
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CBD5E0', // Borda sutil
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45, // Altura um pouco menor para inputs dentro de cards
    fontSize: 16,
    color: '#2D3748',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  depositButton: {
    backgroundColor: '#38A169', // Verde para depósito
    shadowColor: '#38A169',
  },
  withdrawButton: {
    backgroundColor: '#E53E3E', // Vermelho para saque
    shadowColor: '#E53E3E',
    marginTop: 10, // Espaçamento entre botões
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
