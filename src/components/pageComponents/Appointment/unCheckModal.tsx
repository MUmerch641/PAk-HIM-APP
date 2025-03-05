import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

interface UnCheckModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const UnCheckModal: React.FC<UnCheckModalProps> = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Change status from Check to Active?
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]}
              onPress={onConfirm}
            >
              <Text style={styles.submitButtonText}>YES</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: moderateScale(4),
    padding: moderateScale(20),
    width: width * 0.4,
    maxWidth: 400,
    minWidth: 300,
  },
  modalText: {
    fontSize: moderateScale(14),
    color: '#333',
    marginBottom: verticalScale(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: moderateScale(10),
  },
  button: {
    paddingHorizontal: moderateScale(15),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(4),
  },
  cancelButton: {
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#0066FF',
  },
  cancelButtonText: {
    color: '#0066FF',
    fontSize: moderateScale(14),
  },
  submitButtonText: {
    color: 'white',
    fontSize: moderateScale(14),
  },
});

export default UnCheckModal;