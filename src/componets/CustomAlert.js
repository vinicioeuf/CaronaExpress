// src/components/CustomAlert.js

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const CustomAlert = ({ visible, onClose, message, iconName, iconColor }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Feather name={iconName} size={40} color={iconColor || '#6B46C1'} style={styles.icon} />
          <Text style={styles.modalText}>{message}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: iconColor || '#6B46C1' }]}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
    maxWidth: 400,
  },
  icon: {
    marginBottom: 20,
  },
  modalText: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    color: '#333'
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  }
});

export default CustomAlert;