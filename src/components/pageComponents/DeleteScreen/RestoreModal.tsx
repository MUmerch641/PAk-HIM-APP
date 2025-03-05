import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../../../utils/color';

interface RestoreModalProps {
  visible: boolean;
  onClose: () => void;
  onRestore: () => void;
}

export const RestoreModal = ({ visible, onClose, onRestore }: RestoreModalProps) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const currentColors = isDarkMode ? colors.dark : colors.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles(currentColors).overlay}>
        <View style={styles(currentColors).modalContainer}>
          <Text style={styles(currentColors).title}>
            Are you sure you want to restore{'\n'}this appointment?
          </Text>
          
          <View style={styles(currentColors).buttonContainer}>
            <TouchableOpacity
              style={[styles(currentColors).button, styles(currentColors).cancelButton]}
              onPress={onClose}
            >
              <Text style={styles(currentColors).cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles(currentColors).button, styles(currentColors).restoreButton]}
              onPress={onRestore}
            >
              <Text style={styles(currentColors).restoreButtonText}>RESTORE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = (currentColors: { [key: string]: string }) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: currentColors.background,
    borderRadius: 4,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    color: currentColors.actionMenuTextColor,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 4,
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: currentColors.background,
    borderWidth: 1,
    borderColor: currentColors.dropdownText,
  },
  restoreButton: {
    backgroundColor: currentColors.dropdownText,
  },
  cancelButtonText: {
    color: currentColors.dropdownText,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  restoreButtonText: {
    color: currentColors.background,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});