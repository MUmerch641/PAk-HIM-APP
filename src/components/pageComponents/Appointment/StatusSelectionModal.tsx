import { Appointment, getStatusOptions } from '@/src/ApiHandler/Appointment';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Toast from 'react-native-toast-message';
import { useColorScheme } from 'react-native';
import { colors } from '../../../utils/color';

const { width } = Dimensions.get('window');

interface StatusSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (status: string) => void;
}

const StatusSelectionModal: React.FC<StatusSelectionModalProps> = ({ visible, onClose, onSelect }) => {
    const [selectedStatus, setSelectedStatus] = React.useState('opd');
    const [Options, setOptions] = useState<Appointment[]>([]);

    const handleSubmit = () => {
        onSelect(selectedStatus);
        onClose();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await getStatusOptions();
                setOptions(response);
            } catch (error) {

                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Error fetching status options',
                });
            }
        };
        fetchData();
    }, [])

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
            <View style={styles(currentColors).modalOverlay}>
                <View style={styles(currentColors).modalContent}>
                    <Text style={styles(currentColors).modalTitle}>Change status from Active to Check?</Text>

                    <Text style={styles(currentColors).selectLabel}>Select Status</Text>

                    <View style={styles(currentColors).radioGroup}>

                        {Options && Options.map((e, idx) => {
                            return <TouchableOpacity
                                style={styles(currentColors).radioOption}
                                onPress={() => setSelectedStatus(e.optionName)}
                                key={idx}
                            >
                                <View style={styles(currentColors).radioButton}>
                                    <View style={[
                                        styles(currentColors).radioInner,
                                        selectedStatus === e.optionName && styles(currentColors).radioSelected
                                    ]} />
                                </View>
                                <Text style={styles(currentColors).radioLabel}>{e.optionName}</Text>
                            </TouchableOpacity>
                        })}

                    </View>

                    <Text style={styles(currentColors).noteText}>
                        Note: If you want to add more disposal options, please log in as admin and navigate to Settings → Disposal Options.
                    </Text>

                    <View style={styles(currentColors).buttonContainer}>
                        <TouchableOpacity
                            style={[styles(currentColors).button, styles(currentColors).cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles(currentColors).cancelButtonText}>CANCEL</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles(currentColors).button, styles(currentColors).submitButton]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles(currentColors).submitButtonText}>YES</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = (currentColors: { [key: string]: string }) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: currentColors.background,
        borderRadius: moderateScale(8),
        padding: moderateScale(20),
        width: width * 0.9,
        maxWidth: 500,
    },
    modalTitle: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: currentColors.actionMenuTextColor,
        marginBottom: verticalScale(15),
    },
    selectLabel: {
        fontSize: moderateScale(14),
        color: currentColors.actionMenuTextColor,
        marginBottom: verticalScale(10),
    },
    radioGroup: {
        marginBottom: verticalScale(15),
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: verticalScale(5),
    },
    radioButton: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: moderateScale(10),
        borderWidth: moderateScale(2),
        borderColor: currentColors.dropdownBorder,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: moderateScale(10),
    },
    radioInner: {
        width: moderateScale(12),
        height: moderateScale(12),
        borderRadius: moderateScale(6),
        backgroundColor: 'transparent',
    },
    radioSelected: {
        backgroundColor: currentColors.dropdownText,
    },
    radioLabel: {
        fontSize: moderateScale(14),
        color: currentColors.actionMenuTextColor,
    },
    noteText: {
        fontSize: moderateScale(12),
        color: currentColors.actionMenuTextColor,
        marginBottom: verticalScale(20),
        fontStyle: 'italic',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: moderateScale(10),
    },
    button: {
        paddingHorizontal: moderateScale(20),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(4),
    },
    cancelButton: {
        backgroundColor: currentColors.background,
        borderWidth: moderateScale(1),
        borderColor: currentColors.dropdownText,
    },
    submitButton: {
        backgroundColor: currentColors.dropdownText,
    },
    cancelButtonText: {
        color: currentColors.dropdownText,
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
    submitButtonText: {
        color: currentColors.background,
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
});

export default StatusSelectionModal;