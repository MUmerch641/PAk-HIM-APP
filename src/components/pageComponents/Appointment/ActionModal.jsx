import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from 'react-native-size-matters';
import { useColorScheme } from 'react-native';
import { colors } from '../../../utils/color';
import { Platform } from 'react-native';

const ActionModal = ({ isOpen, onClose, onAction, appointment, activeTab }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const actions = [
    {
      icon: 'pencil',
      label: 'Edit',
      color: '#4CAF50',
      action: () => onAction('edit', appointment)
    },
    {
      icon: 'trash',
      label: 'Delete',
      color: '#F44336',
      action: () => onAction('delete', appointment)
    },
    {
      icon: 'ticket',
      label: 'Token',
      color: '#2196F3',
      action: () => onAction('token', appointment)
    },
    {
      icon: 'checkmark-circle',
      label: activeTab === 'checked' ? 'Uncheck' : 'Check',
      color: '#FF9800',
      action: () => onAction('check', appointment)
    },
    {
      icon: 'pulse',
      label: 'Vitals',
      color: '#9C27B0',
      action: () => onAction('vitals', appointment)
    }
  ];

  return (
    <Modal visible={isOpen} transparent={true} animationType="fade">
      <TouchableOpacity style={styles(currentColors).modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles(currentColors).modalContent}>
          <View style={styles(currentColors).modalHeader}>
            <Text style={styles(currentColors).modalTitle}>Actions</Text>
            <TouchableOpacity style={styles(currentColors).closeIconButton} onPress={onClose}>
              <Ionicons name="close" size={moderateScale(24)} color="#F44336" />
            </TouchableOpacity>
          </View>
          <View style={styles(currentColors).actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles(currentColors).actionButton}
                onPress={() => {
                  action.action();
                  onClose();
                }}
              >
                <Ionicons name={action.icon} size={moderateScale(24)} color={action.color} />
                <Text style={[styles(currentColors).actionLabel, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
const styles = (currentColors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: currentColors.background,
    borderRadius: moderateScale(10),
    padding: moderateScale(20),
    paddingTop: moderateScale(10),
    alignItems: 'center',
     },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(20),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: currentColors.actionMenuTextColor,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: moderateScale(20),
  },
  actionLabel: {
    marginTop: moderateScale(5),
    fontSize: moderateScale(14),
  },
  closeButton: {
    marginTop: moderateScale(20),
    padding: moderateScale(10),
    backgroundColor: '#0066FF',
    borderRadius: moderateScale(5),
  },
  closeButtonText: {
    color: 'white',
    fontSize: moderateScale(16),
  },
  closeIconButton: {
    borderWidth: 2,
    borderColor: '#F44336',
    borderRadius: moderateScale(12),
    padding: moderateScale(2),
  },
});

export default ActionModal;