import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  TextInput,
  Platform,
  // Removido Modal e Pressable daqui, pois não serão mais usados para QR Code
  ActivityIndicator,
} from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';

import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot, runTransaction } from 'firebase/firestore';

export default function Saldo() {
  const [userData, setUserData] = useState(null);
  const [depositoValor, setDepositoValor] = useState('');
  const [saqueValor, setSaqueValor] = useState('');
  const [loading, setLoading] = useState(true);
  // Removido estados relacionados ao QR Code Pix
  // const [qrCodeModalVisible, setQrCodeModalVisible] = useState(false);
  // const [pixQrCodeBase64, setPixQrCodeBase64] = useState('');
  // const [pixCopiaCola, setPixCopiaCola] = useState('');

  // Removido chaves do Mercado Pago
  // const MERCADO_PAGO_PUBLIC_KEY = "TEST-e616f733-4f05-4c07-8898-d14d2a9d20c5";
  // const MERCADO_PAGO_ACCESS_TOKEN = "YOUR_MERCADO_PAGO_ACCESS_TOKEN";

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.warn("Documento de usuário não encontrado no Firestore.");
            setUserData({
                displayName: user.displayName || 'Usuário',
                email: user.email,
                photoURL: user.photoURL || null,
                balance: 0,
            });
          }
          setLoading(false);
        }, (error) => {
          console.error("Erro ao carregar dados do usuário:", error);
          Alert.alert("Erro", "Não foi possível carregar seus dados de perfil.");
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleDepositar = async () => {
    const valor = parseFloat(depositoValor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor de depósito válido.');
      return;
    }

    if (!userData || !auth.currentUser) { // Verifica se userData e auth.currentUser estão disponíveis
        Alert.alert('Erro', 'Dados do usuário incompletos ou não autenticado para depósito.');
        return;
    }

    setLoading(true);
    try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
            balance: (userData.balance || 0) + valor // Garante que balance seja um número
        });
        Alert.alert('Sucesso', `Depósito de R$ ${valor.toFixed(2).replace('.', ',')} realizado com sucesso!`);
        setDepositoValor(''); // Limpa o campo
    } catch (firestoreError) {
        console.error("Erro ao realizar depósito no Firestore:", firestoreError);
        Alert.alert("Erro", "Não foi possível realizar o depósito. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  const handleSacar = async () => {
    const valor = parseFloat(saqueValor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor de saque válido.');
      return;
    }
    if (!userData || (userData.balance || 0) < valor) { // Garante que balance seja um número
      Alert.alert('Erro', 'Saldo insuficiente para realizar o saque.');
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        balance: userData.balance - valor
      });

      Alert.alert('Sucesso', `Saque de R$ ${valor.toFixed(2).replace('.', ',')} solicitado. Seu saldo foi atualizado.`);
      setSaqueValor('');
    } catch (error) {
      console.error('Erro ao solicitar saque:', error);
      Alert.alert('Erro no Saque', 'Não foi possível solicitar o saque. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B46C1" />
          <Text style={styles.loadingText}>Carregando perfil e saldo...</Text>
        </View>
      </SafeAreaView>
    );
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
              <Image source={{ uri: userData?.photoURL || 'https://placehold.co/150x150/E2E8F0/4A5568?text=User' }} style={styles.avatar} />
              <View style={styles.infoList}>
                <Text style={styles.infoItem}><Feather name="user" size={16} color="#4A5568" /> Nome: {userData?.displayName || 'Usuário'}</Text>
                <Text style={styles.infoItem}><Feather name="mail" size={16} color="#4A5568" /> Email: {userData?.email || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Saldo */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saldo Atual</Text>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Seu Saldo:</Text>
              <Text style={styles.balanceValue}>R$ {userData?.balance !== undefined ? userData.balance.toFixed(2).replace('.', ',') : '0,00'}</Text>
            </View>
          </View>

          {/* Seção de Depósito */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Depositar</Text> {/* Título ajustado */}
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
            <Text style={styles.cardTitle}>Sacar</Text> {/* Título ajustado */}
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

      {/* Removido o Modal de QR Code */}
      {/* <Modal
        animationType="fade"
        transparent={true}
        visible={qrCodeModalVisible}
        onRequestClose={() => setQrCodeModalVisible(false)}
      >
        <Pressable style={styles.qrModalOverlay} onPress={() => setQrCodeModalVisible(false)}>
          <View style={styles.qrModalContent}>
            <Pressable style={styles.qrModalCloseButton} onPress={() => setQrCodeModalVisible(false)}>
              <Ionicons name="close-circle-outline" size={30} color="#4A5568" />
            </Pressable>
            <Text style={styles.qrModalTitle}>Escaneie para Depositar</Text>
            {pixQrCodeBase64 ? (
              <Image
                source={{ uri: `data:image/png;base64,${pixQrCodeBase64}` }}
                style={styles.qrCodeImage}
              />
            ) : (
              <Text style={styles.qrModalText}>Gerando QR Code...</Text>
            )}
            <Text style={styles.qrModalSubtitle}>Ou copie e cole o código:</Text>
            <Text selectable={true} style={styles.pixCopiaColaText}>{pixCopiaCola}</Text>
            <Text style={styles.qrModalWarning}>
              * Em um app real, o saldo só seria atualizado após a confirmação do pagamento pelo Mercado Pago (via webhook para um backend).
            </Text>
          </View>
        </Pressable>
      </Modal> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
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
    borderBottomColor: '#E2E8F0',
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
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#6B46C1',
  },
  infoList: {
    flex: 1,
  },
  infoItem: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 5,
    flexDirection: 'row',
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
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#38A169',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CBD5E0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
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
    backgroundColor: '#38A169',
    shadowColor: '#38A169',
  },
  withdrawButton: {
    backgroundColor: '#E53E3E',
    shadowColor: '#E53E3E',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  // Estilos do Modal QR Code removidos, mas mantidos aqui para referência se precisar reintroduzir
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  qrModalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  qrModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 15,
    textAlign: 'center',
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrModalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 10,
    textAlign: 'center',
  },
  pixCopiaColaText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E0',
  },
  qrModalText: {
    fontSize: 15,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 15,
  },
  qrModalWarning: {
    fontSize: 12,
    color: '#E53E3E',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});
