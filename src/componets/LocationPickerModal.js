import React, { useState } from 'react';
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LocationPickerModal({ isVisible, onClose, onSelect, locations, placeholder }) {
  const [searchText, setSearchText] = useState('');
  const filteredLocations = locations.filter(location =>
    location.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.locationItem} onPress={() => onSelect(item)}>
      <Text style={styles.locationItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Selecione o Local</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={30} color="#4A5568" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrapper}>
            <Feather name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor="#A0AEC0"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            style={styles.locationList}
            contentContainerStyle={styles.locationListContent}
            ListEmptyComponent={() => (
              <Text style={styles.noResultsText}>Nenhum local encontrado.</Text>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', // Overlay escuro
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#F7FAFC', // Fundo do modal
    borderRadius: 20,
    width: width * 0.9,
    height: height * 0.8, // Ocupa 80% da altura da tela
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
  },
  closeButton: {
    padding: 5,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2D3748',
  },
  locationList: {
    flex: 1,
  },
  locationListContent: {
    paddingBottom: 10,
  },
  locationItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  locationItemText: {
    fontSize: 16,
    color: '#4A5568',
  },
  noResultsText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 20,
  },
});
