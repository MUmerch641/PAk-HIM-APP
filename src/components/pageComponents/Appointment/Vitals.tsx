import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import UrgentCaseAlert from './UrgentAlert';
import Toast from 'react-native-toast-message'; // Make sure to install this package
import { getAuthToken } from '@/src/ApiHandler/Appointment';
import { api } from '@/api';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useColorScheme } from 'react-native';
import { colors } from '@/src/utils/color';

interface VitalField {
    id: string;
    title: string;
    measure: string;
}

interface Appointment {
    weight?: string;
    temperature?: string;
    BP?: string;
    HR?: string;
    RR?: string;
    extra?: VitalField[];
    vitals?: {
        BP?: string;
        HR?: string;
        RR?: string;
        weight?: string;
        temperature?: string;
        extra?: VitalField[];
        emergencyMessage?: string;
        message?: string,
        isActive?: boolean;
        _id?: string;
    };
    patientId?: string;
    _id?: string; // Added appointment ID
}

interface VitalsProps {
    visible: boolean;
    onClose: () => void;
    onSave: (appointment: Appointment) => void;
    appointment: Appointment;
    setIsLoading: (loading: boolean) => void;
    fetchAppointments: () => void;
    // emergencyMsg: string;
}

interface ValidationErrors {
    weight?: string;
    temperature?: string;
    BP?: string;
    HR?: string;
    RR?: string;
}

export const updateVitalById = async (
    BP: string,
    HR: string,
    RR: string,
    appointmentId: string,
    symptoms: string,
    temperature: string,
    weight: string,
    extra?: { [key: string]: any },
    isEmergencyIn1Hr?: boolean,
    isEmergencyIn10Mint?: boolean,
    message?: string,
): Promise<void> => {
    try {
        const token = await getAuthToken();
        if (!token) {
            throw new Error("No auth token found");
        }

        const response = await api.put(
            `/vitals/updateVitalById/${appointmentId}`,
            {
                BP,
                HR,
                RR,
                symptoms,
                temperature,
                weight,
                extra,
                isEmergencyIn1Hr,
                isEmergencyIn10Mint,
                message
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (response.status === 200) {
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Vitals updated successfully",
            });
        } else {
            throw new Error(`Failed to update vitals: ${response.statusText}`);
        }
    } catch (error: any) {
        Toast.show({
            type: "error",
            text1: "Error",
            text2: error.response?.data?.message || "Error updating vitals",
        });
        throw error;
    }
};

const Vitals: React.FC<VitalsProps> = ({
    visible,
    onClose,
    onSave,
    appointment,
    setIsLoading,
    fetchAppointments,
    // emergencyMsg


}) => {
    const [weight, setWeight] = useState<string>('');
    const [temperature, setTemperature] = useState<string>('');
    const [BP, setBP] = useState<string>('');
    const [HR, setHR] = useState<string>('');
    const [RR, setRR] = useState<string>('');
    const [extraVitals, setExtraVitals] = useState<VitalField[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [alertVisible, setAlertVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [emergencyMsg, setemergencyMsg] = useState('')

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const currentColors = isDarkMode ? colors.dark : colors.light;

    useEffect(() => {
        setWeight('');
        setTemperature('');
        setBP('');
        setHR('');
        setRR('');
        setemergencyMsg('')
        setExtraVitals([]);
        setAlertVisible(false);

        if (appointment?.vitals) {
            setWeight(appointment.vitals.weight || '');
            setTemperature(appointment.vitals.temperature || '');
            setBP(appointment.vitals.BP || '');
            setHR(appointment.vitals.HR || '');
            setRR(appointment.vitals.RR || '');
            if (appointment.vitals.extra && appointment.vitals.extra.length > 0) {
                setExtraVitals(appointment.vitals.extra);
            }
            if (appointment?.vitals?.message !== '') {
                setemergencyMsg(appointment?.vitals?.message || '');
                setAlertVisible(true);
            }
        }
    }, [appointment]);


    const updateWeight = (text: string) => {
        setWeight(text);
        if (errors.weight) setErrors({ ...errors, weight: undefined });
    };

    const updateTemperature = (text: string) => {
        setTemperature(text);
        if (errors.temperature) setErrors({ ...errors, temperature: undefined });
    };

    const updateBP = (text: string) => {
        setBP(text);
        if (errors.BP) setErrors({ ...errors, BP: undefined });
    };

    const updateHR = (text: string) => {
        setHR(text);
        if (errors.HR) setErrors({ ...errors, HR: undefined });
    };

    const updateRR = (text: string) => {
        setRR(text);
        if (errors.RR) setErrors({ ...errors, RR: undefined });
    };

    const addVitalField = () => {
        const newField: VitalField = {
            id: Date.now().toString(),
            title: '',
            measure: ''
        };
        setExtraVitals([...extraVitals, newField]);
    };

    const updateVitalField = (id: string, field: 'title' | 'measure', value: string) => {
        setExtraVitals(extraVitals.map(vital =>
            vital.id === id ? { ...vital, [field]: value } : vital
        ));
    };

    const deleteVitalField = (id: string) => {
        setExtraVitals(extraVitals.filter(vital => vital.id !== id));
    };

    const validateFields = (): boolean => {
        let newErrors: ValidationErrors = {};
        let isValid = true;

        if (!weight && !temperature && !BP && !HR && !RR && extraVitals.length === 0) {
            newErrors = {
                weight: 'At least one vital is required.',
                temperature: 'At least one vital is required.',
                BP: 'At least one vital is required.',
                HR: 'At least one vital is required.',
                RR: 'At least one vital is required.',
            };
            isValid = false;
        }

        if (weight && (!/^\d{1,3}$/.test(weight) || parseInt(weight) <= 0)) {
            newErrors.weight = 'Weight must be a positive number with a maximum of 3 digits.';
            isValid = false;
        }

        if (temperature) {
            const temp = parseFloat(temperature);
            if (isNaN(temp) || temp < 92 || temp > 110) {
                newErrors.temperature = 'Temperature must be between 92 and 110 Fahrenheit.';
                isValid = false;
            }
        }

        if (HR) {
            const heartRate = parseInt(HR);
            if (isNaN(heartRate) || heartRate < 50 || heartRate > 250) {
                newErrors.HR = 'Heart Rate must be between 50 and 250 per minute.';
                isValid = false;
            }
        }

        if (BP) {
            if (!/^\d{2,3}\/\d{2,3}$/.test(BP)) {
                newErrors.BP = 'Blood Pressure must be in format systolic/diastolic (e.g., 120/80).';
                isValid = false;
            } else {
                const [systolic, diastolic] = BP.split('/').map(val => parseInt(val));
                if (systolic < 70 || systolic > 220) {
                    newErrors.BP = 'Systolic pressure should be between 70 and 220.';
                    isValid = false;
                } else if (diastolic < 40 || diastolic > 130) {
                    newErrors.BP = 'Diastolic pressure should be between 40 and 130.';
                    isValid = false;
                }
            }
        }

        if (RR) {
            const respRate = parseInt(RR);
            if (isNaN(respRate) || respRate < 0 || respRate > 80) {
                newErrors.RR = 'Respiratory Rate must be between 0 and 80 per minute.';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    interface ExtraVitalsObject {
        [key: string]: string;
    }

    const handleSave = async (SAVE: string): Promise<void> => {
        if (!validateFields()) return;

        // First, check if temperature, RR, or HR values exist before parsing them
        const tempValue = temperature ? parseFloat(temperature) : null;
        const rrValue = RR ? parseInt(RR) : null;
        const hrValue = HR ? parseInt(HR) : null;

        // Build the emergency message
        let emergencyMessage = "";

        if (tempValue !== null && tempValue > 100) {
            emergencyMessage += "High temperature detected. ";
        }
        if (tempValue !== null && tempValue < 92) {
            emergencyMessage += "Low temperature detected. ";
        }
        if (rrValue !== null && rrValue > 20) {
            emergencyMessage += "High respiratory rate detected. ";
        }
        if (rrValue !== null && rrValue < 12) {
            emergencyMessage += "Low respiratory rate detected. ";
        }
        if (hrValue !== null && hrValue > 180) {
            emergencyMessage += "High heart rate detected. ";
        }
        if (hrValue !== null && hrValue < 30) {
            emergencyMessage += "Low heart rate detected. ";
        }

        // Set the emergency message once
        setemergencyMsg(emergencyMessage);

        // Determine if it's an emergency based on if we have any message
        const isEmergency = emergencyMessage.length > 0;

        if (!weight && !temperature && !BP && !HR && !RR && extraVitals.length === 0) return;

        try {
            setIsLoading(true);
            setIsSaving(true);
            const appointmentId = appointment.vitals?._id || appointment._id;

            if (!appointmentId) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Missing appointment ID"
                });
                setIsLoading(false);
                setIsSaving(false);
                return;
            }

            // Convert extraVitals array to object if needed
            const extraObject = extraVitals.length > 0
                ? extraVitals.reduce((acc, vital) => ({
                    ...acc,
                    [vital.title]: vital.measure
                }), {})
                : undefined;

            if (SAVE === 'UPDATE') {
                // setemergencyMsg('')
                await updateVitalById(
                    BP || "",
                    HR || "",
                    RR || "",
                    appointmentId,
                    "", // symptoms
                    temperature || "",
                    weight || "",
                    extraObject,
                    false, // isEmergencyIn1Hr
                    alertVisible, // isEmergencyIn10Mint
                    emergencyMessage || ""
                );

                setWeight('');
                setTemperature('');
                setBP('');
                setHR('');
                setRR('');
                setExtraVitals([]);
                setAlertVisible(false);

                await fetchAppointments();
                onClose();
            }
            else {
                onSave({
                    ...appointment,
                    vitals: {
                        ...appointment.vitals,
                        weight: weight || undefined,
                        temperature: temperature || undefined,
                        BP: BP || undefined,
                        HR: HR || undefined,
                        RR: RR || undefined,
                        extra: extraVitals.length > 0 ? extraVitals : undefined,
                        isActive: true,
                        message: emergencyMessage || undefined  // Use emergencyMessage directly here
                    }
                });

                // Optional: Call API even for non-emergency updates
                setWeight('');
                setTemperature('');
                setBP('');
                setHR('');
                setRR('');
                setExtraVitals([]);
                // setemergencyMsg('');
                setAlertVisible(false);
                fetchAppointments();
                onClose();
            }

        } catch (error) {
            console.error("Error updating vitals:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to save vitals"
            });
        } finally {
            setIsLoading(false);
            setIsSaving(false);
        }
    };
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            {alertVisible ? (
                <UrgentCaseAlert
                    visible={alertVisible}
                    message={emergencyMsg}
                    onClose={() => setAlertVisible(false)}
                />
            ) : (
                <View style={styles(currentColors).modalOverlay}>
                    <View style={styles(currentColors).modalContent}>
                        <View style={styles(currentColors).modalHeader}>
                            <Text style={styles(currentColors).modalTitle}>Vitals</Text>
                            <Pressable onPress={onClose} style={styles(currentColors).closeButton} disabled={isSaving}>
                                <Text style={styles(currentColors).closeButtonText}>✕</Text>
                            </Pressable>
                        </View>

                        <ScrollView style={styles(currentColors).scrollContainer}>
                            <View style={styles(currentColors).inputRow}>
                                <View style={styles(currentColors).inputContainer}>
                                    <Text style={styles(currentColors).label}>Max 3 digits</Text>
                                    <TextInput
                                        style={[styles(currentColors).input, errors.weight && styles(currentColors).inputError]}
                                        value={weight}
                                        onChangeText={updateWeight}
                                        placeholder="Weight"
                                        keyboardType="numeric"
                                        maxLength={3}
                                        editable={!isSaving}
                                        placeholderTextColor="grey"
                                    />
                                    {errors.weight && <Text style={styles(currentColors).errorText}>{errors.weight}</Text>}
                                </View>
                                <View style={styles(currentColors).inputContainer}>
                                    <Text style={styles(currentColors).label}>Temp (92-110°F)</Text>
                                    <TextInput
                                        style={[styles(currentColors).input, errors.temperature && styles(currentColors).inputError]}
                                        value={temperature}
                                        onChangeText={updateTemperature}
                                        placeholder="Temperature"
                                        keyboardType="numeric"
                                        editable={!isSaving}
                                        placeholderTextColor="grey"
                                    />
                                    {errors.temperature && <Text style={styles(currentColors).errorText}>{errors.temperature}</Text>}
                                </View>
                            </View>

                            <View style={styles(currentColors).inputRow}>
                                <View style={styles(currentColors).inputContainer}>
                                    <Text style={styles(currentColors).label}>HR (50-250/min)</Text>
                                    <TextInput
                                        style={[styles(currentColors).input, errors.HR && styles(currentColors).inputError]}
                                        value={HR}
                                        onChangeText={updateHR}
                                        placeholder="HR"
                                        keyboardType="numeric"
                                        editable={!isSaving}
                                        placeholderTextColor="grey"
                                    />
                                    {errors.HR && <Text style={styles(currentColors).errorText}>{errors.HR}</Text>}
                                </View>
                                <View style={styles(currentColors).inputContainer}>
                                    <Text style={styles(currentColors).label}>BP (e.g., 120/80)</Text>
                                    <TextInput
                                        style={[styles(currentColors).input, errors.BP && styles(currentColors).inputError]}
                                        value={BP}
                                        onChangeText={updateBP}
                                        placeholder="BP"
                                        editable={!isSaving}
                                        placeholderTextColor="grey"
                                    />
                                    {errors.BP && <Text style={styles(currentColors).errorText}>{errors.BP}</Text>}
                                </View>
                            </View>

                            <View style={styles(currentColors).inputRow}>
                                <View style={styles(currentColors).inputContainer}>
                                    <Text style={styles(currentColors).label}>RR (0-80/min)</Text>
                                    <TextInput
                                        style={[styles(currentColors).input, errors.RR && styles(currentColors).inputError]}
                                        value={RR}
                                        onChangeText={updateRR}
                                        placeholder="RR"
                                        keyboardType="numeric"
                                        editable={!isSaving}
                                        placeholderTextColor="grey"
                                    />
                                    {errors.RR && <Text style={styles(currentColors).errorText}>{errors.RR}</Text>}
                                </View>
                                <View style={styles(currentColors).inputContainer} />
                            </View>

                            {extraVitals.length > 0 && (
                                <View style={styles(currentColors).extraVitalsContainer}>
                                    <Text style={styles(currentColors).extraVitalsTitle}>Additional Vitals</Text>
                                    {extraVitals.map((vital) => (
                                        <View key={vital.id} style={styles(currentColors).extraVitalRow}>
                                            <View style={styles(currentColors).extraVitalInputContainer}>
                                                <TextInput
                                                    style={styles(currentColors).extraVitalInput}
                                                    value={vital.title}
                                                    onChangeText={(text) => updateVitalField(vital.id, 'title', text)}
                                                    placeholder="Title"
                                                    editable={!isSaving}
                                                    placeholderTextColor="grey"
                                                />
                                            </View>
                                            <View style={styles(currentColors).extraVitalInputContainer}>
                                                <TextInput
                                                    style={styles(currentColors).extraVitalInput}
                                                    value={vital.measure}
                                                    onChangeText={(text) => updateVitalField(vital.id, 'measure', text)}
                                                    placeholder="Measurement"
                                                    editable={!isSaving}
                                                    placeholderTextColor="grey"
                                                />
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => deleteVitalField(vital.id)}
                                                style={styles(currentColors).deleteButton}
                                                disabled={isSaving}
                                            >
                                                <Text style={styles(currentColors).deleteButtonText}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles(currentColors).buttonContainer}>
                            <TouchableOpacity style={styles(currentColors).addButton} onPress={addVitalField} disabled={isSaving}>
                                <Text style={styles(currentColors).addButtonText}>+ Add Vital</Text>
                            </TouchableOpacity>
                            <View>
                                {isSaving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <View >
                                        {appointment?.vitals?.message === undefined ?
                                            <TouchableOpacity style={styles(currentColors).saveButton} onPress={()=> handleSave('SAVE')} disabled={isSaving} >
                                                <Text style={styles(currentColors).saveButtonText}>SAVE</Text>
                                            </TouchableOpacity>
                                            : appointment?.vitals?.message !== '' ?
                                                <TouchableOpacity style={styles(currentColors).saveButton}  onPress={()=> handleSave('UPDATE')} disabled={isSaving} >
                                                    <Text style={styles(currentColors).saveButtonText}>UPDATE</Text>
                                                </TouchableOpacity>
                                                :
                                                <TouchableOpacity style={styles(currentColors).saveButton}  onPress={()=> handleSave('SAVE')} disabled={isSaving} >
                                                    <Text style={styles(currentColors).saveButtonText}>SAVE</Text>
                                                </TouchableOpacity>}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            )}
            <Toast />
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
        borderRadius: moderateScale(10),
        padding: moderateScale(20),
        width: '90%',
        maxWidth: moderateScale(400),
        maxHeight: '80%',
    },
    scrollContainer: {
        flexGrow: 0,
    },
    modalHeader: {
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
    closeButton: {
        padding: moderateScale(5),
    },
    closeButtonText: {
        fontSize: moderateScale(20),
        color: currentColors.actionMenuTextColor,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: moderateScale(15),
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: moderateScale(5),
    },
    label: {
        fontSize: moderateScale(14),
        marginBottom: moderateScale(5),
        color: currentColors.actionMenuTextColor,
    },
    input: {
        borderWidth: moderateScale(1),
        borderColor: currentColors.dropdownBorder,
        borderRadius: moderateScale(8),
        padding: moderateScale(10),
        backgroundColor: currentColors.dropdownBackground,
        color: currentColors.actionMenuTextColor,
    },
    inputError: {
        borderColor: '#ff0000',
        borderWidth: moderateScale(1),
    },
    errorText: {
        color: '#ff0000',
        fontSize: moderateScale(12),
        marginTop: moderateScale(5),
    },
    extraVitalsContainer: {
        marginTop: moderateScale(15),
        marginBottom: moderateScale(10),
    },
    extraVitalsTitle: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        marginBottom: moderateScale(10),
        color: currentColors.actionMenuTextColor,
    },
    extraVitalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(10),
    },
    extraVitalInputContainer: {
        flex: 1,
        marginHorizontal: moderateScale(5),
    },
    extraVitalInput: {
        borderWidth: moderateScale(1),
        borderColor: currentColors.dropdownBorder,
        borderRadius: moderateScale(8),
        padding: moderateScale(10),
        backgroundColor: currentColors.dropdownBackground,
        color: currentColors.actionMenuTextColor,
    },
    deleteButton: {
        width: moderateScale(30),
        height: moderateScale(30),
        backgroundColor: '#ff6b6b',
        borderRadius: moderateScale(15),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: moderateScale(5),
    },
    deleteButtonText: {
        color: 'white',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: currentColors.activeTabBackground,
        padding: moderateScale(12),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        marginTop: moderateScale(10),
        marginBottom: moderateScale(20),
        marginRight: moderateScale(10),
    },
    addButtonText: {
        color: currentColors.activeTabText,
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    saveButton: {
        backgroundColor: currentColors.activeTabBackground,
        padding: moderateScale(12),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        marginTop: moderateScale(10),
        marginBottom: moderateScale(20),
    },
    saveButtonText: {
        color: currentColors.activeTabText,
        fontSize: moderateScale(15),
        fontWeight: '600',
    },
});

export default Vitals;