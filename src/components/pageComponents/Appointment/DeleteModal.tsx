import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useColorScheme } from 'react-native';
import { colors } from '../../../utils/color';

interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: (reason: string) => void;
}

export const DeleteModal = ({ visible, onClose, onDelete }: DeleteModalProps) => {
  const [reason, setReason] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const handleDelete = () => {
    if (reason.trim() === '') {
      setIsEmpty(true);
    } else {
      onDelete(reason);
      setReason('');
      setIsEmpty(false);
    }
  };

  const handleClose = () => {
    onClose();
    setReason('');
    setIsEmpty(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles(currentColors).overlay}>
        <View style={styles(currentColors).modalContainer}>
          <Text style={styles(currentColors).title}>Are you sure you want to delete?</Text>
          
          <TextInput
            style={[
              styles(currentColors).input, 
              isEmpty && styles(currentColors).inputError, 
              { borderColor: isFocused ? currentColors.dropdownText : currentColors.dropdownBorder }
            ]}
            placeholder="Reason for deletion"
            value={reason}
            onChangeText={(text) => {
              setReason(text);
              if (text.trim() !== '') {
                setIsEmpty(false);
              }
            }}
            placeholderTextColor={'grey'}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          {isEmpty && <Text style={styles(currentColors).errorText}>Reason is required</Text>}
          
          <View style={styles(currentColors).buttonContainer}>
            <TouchableOpacity
              style={[styles(currentColors).button, styles(currentColors).cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles(currentColors).cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles(currentColors).button, styles(currentColors).deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles(currentColors).deleteButtonText}>DELETE</Text>
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
    borderRadius: moderateScale(8),
    padding: moderateScale(20),
    width: '80%',
    maxWidth: moderateScale(400),
  },
  title: {
    fontSize: scale(18),
    fontWeight: '500',
    marginBottom: verticalScale(20),
    textAlign: 'center',
    color: currentColors.actionMenuTextColor,
  },
  input: {
    borderWidth: moderateScale(1),
    borderColor: currentColors.dropdownBorder,
    borderRadius: moderateScale(4),
    padding: moderateScale(12),
    marginBottom: verticalScale(20),
    fontSize: scale(16),
    color: currentColors.actionMenuTextColor,
  },
  inputError: {
    marginBottom: 0,
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: scale(12),
    marginBottom: verticalScale(10),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: moderateScale(10),
  },
  button: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(4),
    minWidth: moderateScale(80),
  },
  cancelButton: {
    backgroundColor: '#0066FF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: scale(14),
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: scale(14),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DeleteModal;
