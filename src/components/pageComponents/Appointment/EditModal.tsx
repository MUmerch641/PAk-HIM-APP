import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { getDoctors } from '@/src/ApiHandler/Patient';
import { useColorScheme } from 'react-native';
import { colors } from '@/src/utils/color';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface Patient {
    _id: string;
    city: string;
    cnic: string;
    createdAt: string;
    dob: string;
    gender: string;
    guardiansName: string;
    healthId: string;
    isActive: boolean;
    isDeleted: boolean;
    mrn: number;
    patientName: string;
    phonNumber: string;
    projectId: string;
    reference: string;
    updatedAt: string;
    userId: string;
}

interface Service {
    _id: string;
    fee: number;
    hospitalChargesInPercentage: number;
    serviceName: string;
    turnaround_time: number;
}

interface Appointment {
    _id?: string;
    appointmentCheckedStatus?: string;
    appointmentDate?: string;
    appointmentTime?: {
        from: string;
        to: string;
    };
    checkedDateAndTime?: string;
    createdAt?: string;
    createdBy?: string;
    discount?: number;
    doctor?: {
        _id: string;
        fullName: string;
    };
    doctorId?: string;
    doctorName?: string;
    fee?: number;
    feeStatus?: string;
    insuranceDetails?: {
        claimStatus: string;
        insuranceCompanyId: string;
        insuranceId: string;
    };
    isActive?: boolean;
    isApmtCanceled?: boolean;
    isChecked?: boolean;
    isDeleted?: boolean;
    isPrescriptionCreated?: boolean;
    mrn?: number;
    patientId?: Patient;
    projectId?: string;
    returnableAmount?: number;
    services?: Service[];
    tokenId?: number;
    updatedAt?: string;
    userId?: string;
}

interface EditAppointmentModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (appointment: Appointment) => void;
    appointment: Appointment;
}

interface Doctor {
    _id: string;
    fullName: string;
    services: Service[];
}

interface Colors {
    background: string;
    dropdownBackground: string;
    dropdownBorder: string;
    actionMenuTextColor: string;
    activeTabBackground: string;
    activeTabText: string;
    emergencyRowBackground: string;
}

interface ValidationState {
    status: { valid: boolean; message: string };
    date: { valid: boolean; message: string };
    time: { valid: boolean; message: string };
    totalFee: { valid: boolean; message: string };
    discountPercent: { valid: boolean; message: string };
    discount: { valid: boolean; message: string };
    services: { valid: boolean; message: string };
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
    visible,
    onClose,
    onSave,
    appointment
}) => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const currentColors = isDarkMode ? colors.dark : colors.light;

    const [status, setStatus] = useState<string>(appointment?.feeStatus || '');
    const [services, setServices] = useState<Service[]>([]);
    const [selectedServicesDetails, setSelectedServicesDetails] = useState<Service[]>(appointment?.services || []);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isEnable, setisEnable] = useState(true);
    const [isFirstInteraction, setIsFirstInteraction] = useState(true);
    const pickerRef = useRef(null);

    const [date, setDate] = useState<Date>(
        appointment?.appointmentDate ? new Date(appointment.appointmentDate) : new Date()
    );
    const [time, setTime] = useState<string>(
        appointment?.appointmentTime?.from || ''
    );
    const [totalFee, setTotalFee] = useState<string>(
        appointment?.fee?.toString() || '1000'
    );
    const [discountPercent, setDiscountPercent] = useState<string>('0');
    const [discount, setDiscount] = useState<string>(
        appointment?.discount?.toString() || '0'
    );
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [ServiceLength, setServiceLength] = useState(0);
    const [allServices, setAllServices] = useState<Service[]>([]);

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationState>({
        status: { valid: true, message: '' },
        date: { valid: true, message: '' },
        time: { valid: true, message: '' },
        totalFee: { valid: true, message: '' },
        discountPercent: { valid: true, message: '' },
        discount: { valid: true, message: '' },
        services: { valid: true, message: '' },
    });
    const [formSubmitAttempted, setFormSubmitAttempted] = useState(false);

    useEffect(() => {
        if (appointment) {
            setStatus(appointment.feeStatus || '');
            setDate(appointment.appointmentDate ? new Date(appointment.appointmentDate) : new Date());
            setTime(appointment.appointmentTime?.from || '');
            setTotalFee(appointment.fee?.toString() || '1000');
            setDiscount(appointment.discount?.toString() || '0');
            setServices(appointment.services || []);
            setServiceLength(appointment.services?.length || 0)
            setSelectedServicesDetails(appointment.services || []);
            // Calculate discount percentage
            if (appointment.fee && appointment.discount) {
                const percent = ((appointment.discount / appointment.fee) * 100).toFixed(2);
                setDiscountPercent(percent);
            }
        }
    }, [appointment]);

    useEffect(() => {
        if (visible) {
            setFormSubmitAttempted(false);
            setValidationErrors({
                status: { valid: true, message: '' },
                date: { valid: true, message: '' },
                time: { valid: true, message: '' },
                totalFee: { valid: true, message: '' },
                discountPercent: { valid: true, message: '' },
                discount: { valid: true, message: '' },
                services: { valid: true, message: '' },
            });
        }
    }, [visible]);

    const fetchDoctors = async () => {
        try {
            const response = await getDoctors({});
            const doctorsList: Doctor[] = response.data.map((doctor: any) => ({
                ...doctor,
                services: doctor.services.map((service: any) => ({
                    ...service,
                    turnaround_time: service.turnaround_time || 0, // Ensure turnaround_time is present
                })),
            }));
            setDoctors(doctorsList);
            
            // Collect all services from all doctors
            const allServicesList: Service[] = [];
            doctorsList.forEach(doctor => {
                doctor.services.forEach(service => {
                    if (!allServicesList.some(s => s.serviceName === service.serviceName)) {
                        allServicesList.push(service);
                    }
                });
            });
            setAllServices(allServicesList);
            
            if (doctorsList.length > 0) {
                setSelectedDoctor(doctorsList[0]);
                // Only set services initially, don't override on subsequent fetches
                if (services.length === 0) {
                    setServices(allServicesList);
                }
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    // Calculate payable fee based on total fee and discount
    const calculatePayableFee = () => {
        const total = parseFloat(totalFee) || 0;
        const disc = parseFloat(discount) || 0;
        return (total - disc).toString();
    };

    const handleRemoveService = (serviceName: string) => {
        const updatedServices = selectedServicesDetails.filter(service => service.serviceName !== serviceName);
        setSelectedServicesDetails(updatedServices);
        if (updatedServices.length === 0) {
            setValidationErrors(prev => ({
                ...prev,
                services: { valid: false, message: 'At least one service is required' }
            }));
        } else {
            setValidationErrors(prev => ({
                ...prev,
                services: { valid: true, message: '' }
            }));
        }
    };

    const handleServiceChange = (serviceName: string) => {
        if (serviceName === '') return;
        
        // If this is the first interaction with the dropdown after modal opens
        if (isFirstInteraction && selectedServicesDetails.length > 0) {
            // Clear all previously selected services
            setSelectedServicesDetails([]);
            setIsFirstInteraction(false);
            
            // After clearing, add the newly selected service
            const selectedService = allServices.find(service => service.serviceName === serviceName);
            if (selectedService) {
                setSelectedServicesDetails([selectedService]);
                setValidationErrors(prev => ({
                    ...prev,
                    services: { valid: true, message: '' }
                }));
            }
        } else {
            // For subsequent selections, check for duplicates
            const isDuplicate = selectedServicesDetails.some(service => service.serviceName === serviceName);
            if (!isDuplicate) {
                const selectedService = allServices.find(service => service.serviceName === serviceName);
                if (selectedService) {
                    setSelectedServicesDetails(prev => {
                        const newServices = [...prev, selectedService];
                        setValidationErrors(errors => ({
                            ...errors,
                            services: { valid: true, message: '' }
                        }));
                        return newServices;
                    });
                }
            }
        }
    };

    // Reset first interaction flag when modal closes or reopens
    useEffect(() => {
        if (visible) {
            setIsFirstInteraction(true);
        }
    }, [visible]);

    // Update discount when discount percentage changes
    const handleDiscountPercentChange = (value: string) => {
        const percentValue = parseFloat(value) || 0;
        if (percentValue >= 0 && percentValue <= 100) {
            setDiscountPercent(value);
            const total = parseFloat(totalFee) || 0;
            const discountAmount = (total * percentValue / 100).toString();
            setDiscount(discountAmount);
            setValidationErrors(prev => ({
                ...prev,
                discountPercent: { valid: true, message: '' }
            }));
        } else {
            setDiscountPercent(value);
            setValidationErrors(prev => ({
                ...prev,
                discountPercent: { 
                    valid: false, 
                    message: 'Discount percent must be between 0 and 100' 
                }
            }));
        }
    };

    // Update discount percentage when discount amount changes
    const handleDiscountChange = (value: string) => {
        setDiscount(value);
        const total = parseFloat(totalFee) || 0;
        const discAmount = parseFloat(value) || 0;
        if (discAmount > total) {
            setValidationErrors(prev => ({
                ...prev,
                discount: { 
                    valid: false, 
                    message: 'Discount cannot exceed total fee' 
                }
            }));
        } else {
            setValidationErrors(prev => ({
                ...prev,
                discount: { valid: true, message: '' }
            }));
        }
        if (total > 0) {
            const percentValue = ((discAmount / total) * 100).toFixed(2);
            setDiscountPercent(percentValue);
        }
    };
    
    const validateTime = (timeValue: string) => {
        const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM|am|pm)$/;
        return timeRegex.test(timeValue);
    };
    const validateTotalFee = (fee: string) => {
        const feeValue = parseFloat(fee);
        return !isNaN(feeValue) && feeValue > 0;
    };
    const validateForm = (): boolean => {
        const newValidationState = {
            status: { valid: !!status, message: status ? '' : 'Status is required' },
            date: { valid: true, message: '' },
            time: { 
                valid: validateTime(time), 
                message: validateTime(time) ? '' : 'Enter time in format HH:MM AM/PM' 
            },
            totalFee: { 
                valid: validateTotalFee(totalFee), 
                message: validateTotalFee(totalFee) ? '' : 'Fee must be greater than 0' 
            },
            discountPercent: { 
                valid: parseFloat(discountPercent) >= 0 && parseFloat(discountPercent) <= 100,
                message: 'Discount percent must be between 0 and 100'
            },
            discount: { 
                valid: parseFloat(discount) >= 0 && parseFloat(discount) <= parseFloat(totalFee),
                message: 'Discount cannot exceed total fee'
            },
            services: { 
                valid: selectedServicesDetails.length > 0, 
                message: 'At least one service is required' 
            },
        };
        setValidationErrors(newValidationState);
        return Object.values(newValidationState).every(field => field.valid);
    };

    const handleTimeChange = (value: string) => {
        setTime(value);
        if (formSubmitAttempted) {
            setValidationErrors(prev => ({
                ...prev,
                time: { 
                    valid: validateTime(value), 
                    message: validateTime(value) ? '' : 'Enter time in format HH:MM AM/PM' 
                }
            }));
        }
    };
    const handleTotalFeeChange = (value: string) => {
        setTotalFee(value);
        if (formSubmitAttempted) {
            const feeValid = validateTotalFee(value);
            setValidationErrors(prev => ({
                ...prev,
                totalFee: { 
                    valid: feeValid, 
                    message: feeValid ? '' : 'Fee must be greater than 0' 
                }
            }));
            const discAmount = parseFloat(discount) || 0;
            const totalAmount = parseFloat(value) || 0;
            if (discAmount > totalAmount) {
                setValidationErrors(prev => ({
                    ...prev,
                    discount: { 
                        valid: false, 
                        message: 'Discount cannot exceed total fee' 
                    }
                }));
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    discount: { valid: true, message: '' }
                }));
            }
        }
    };

    const handleSave = () => {
        setFormSubmitAttempted(true);
        if (validateForm()) {
            const updatedAppointment: Appointment = {
                ...appointment, // Retain existing properties
                feeStatus: status,
                appointmentDate: date.toISOString().split('T')[0],
                appointmentTime: {
                    from: time,
                    to: time,
                },
                fee: Number(totalFee),
                discount: Number(discount),
                patientId: appointment.patientId,  // Ensure patientId is correctly retained
                projectId: appointment.projectId,
                userId: appointment.userId,
                services: selectedServicesDetails,
                doctorId: appointment.doctorId,
                doctorName: appointment.doctor?.fullName,
            };
            onSave(updatedAppointment);
            onClose();
        }
    };

    // Populate services in the dropdown
    const getAvailableServices = () => {
        return allServices;
    };

    const getInputStyle = (fieldName: keyof ValidationState) => {
        const isFocused = focusedField === fieldName;
        const isInvalid = formSubmitAttempted && !validationErrors[fieldName].valid;
        return [
            styles(currentColors).input,
            isFocused && styles(currentColors).inputFocused,
            isInvalid && styles(currentColors).inputError
        ];
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles(currentColors).modalOverlay}>
                <View style={styles(currentColors).modalContent}>
                    <View style={styles(currentColors).modalHeader}>
                        <Text style={styles(currentColors).modalTitle}>Edit Appointment</Text>
                        <Pressable onPress={onClose} style={styles(currentColors).closeButton}>
                            <Text style={styles(currentColors).closeButtonText}>✕</Text>
                        </Pressable>
                    </View>
                    <View style={styles(currentColors).inputRow}>
                        <View style={styles(currentColors).inputContainer}>
                            <Text style={styles(currentColors).label}>Status</Text>
                            <View style={[
                                styles(currentColors).pickerContainer,
                                focusedField === 'status' && styles(currentColors).pickerFocused,
                                formSubmitAttempted && !validationErrors.status.valid && styles(currentColors).pickerError
                            ]}>
                                <Picker
                                    selectedValue={status}
                                    onValueChange={(itemValue) => {
                                        setStatus(itemValue);
                                        setValidationErrors(prev => ({
                                            ...prev,
                                            status: { valid: !!itemValue, message: '' }
                                        }));
                                    }}
                                    style={styles(currentColors).picker}
                                    onFocus={() => setFocusedField('status')}
                                    onBlur={() => setFocusedField(null)}
                                >
                                    <Picker.Item label="paid" value="paid" />
                                    <Picker.Item label="unpaid" value="unpaid" />
                                </Picker>
                            </View>
                            {formSubmitAttempted && !validationErrors.status.valid && (
                                <Text style={styles(currentColors).errorText}>{validationErrors.status.message}</Text>
                            )}
                        </View>

                        <View style={styles(currentColors).inputContainer}>
                            <Text style={styles(currentColors).label}>Date</Text>
                            <Pressable
                                style={[
                                    styles(currentColors).input,
                                    focusedField === 'date' && styles(currentColors).inputFocused,
                                    formSubmitAttempted && !validationErrors.date.valid && styles(currentColors).inputError
                                ]}
                                onPress={() => {
                                    setShowDatePicker(true);
                                    setFocusedField('date');
                                }}
                            >
                                <Text style={[{ color: currentColors.actionMenuTextColor }]}>{date.toLocaleDateString()}</Text>
                            </Pressable>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        setFocusedField(null);
                                        if (selectedDate) {
                                            setDate(selectedDate);
                                        }
                                        
                                    }}
                                />
                            )}
                            {formSubmitAttempted && !validationErrors.date.valid && (
                                <Text style={styles(currentColors).errorText}>{validationErrors.date.message}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles(currentColors).inputRow}>
                        <View style={styles(currentColors).inputContainer}>
                            <Text style={styles(currentColors).label}>Time</Text>
                            <TextInput
                                style={getInputStyle('time')}
                                value={time}
                                onChangeText={handleTimeChange}
                                placeholder="HH:MM AM/PM"
                                onFocus={() => setFocusedField('time')}
                                onBlur={() => setFocusedField(null)}
                            />
                            {formSubmitAttempted && !validationErrors.time.valid && (
                                <Text style={styles(currentColors).errorText}>{validationErrors.time.message}</Text>
                            )}
                        </View>

                        <View style={styles(currentColors).inputContainer}>
                            <Text style={styles(currentColors).label}>Total Fee</Text>
                            <TextInput
                                style={getInputStyle('totalFee')}
                                value={totalFee}
                                onChangeText={handleTotalFeeChange}
                                keyboardType="numeric"
                                placeholder="1000"
                                onFocus={() => setFocusedField('totalFee')}
                                onBlur={() => setFocusedField(null)}
                            />
                            {formSubmitAttempted && !validationErrors.totalFee.valid && (
                                <Text style={styles(currentColors).errorText}>{validationErrors.totalFee.message}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles(currentColors).inputRow}>
                        <View style={styles(currentColors).inputContainer}>
                            <Text style={styles(currentColors).label}>Discount %</Text>
                            <TextInput
                                style={getInputStyle('discountPercent')}
                                value={discountPercent}
                                onChangeText={handleDiscountPercentChange}
                                keyboardType="numeric"
                                placeholder="0"
                                onFocus={() => setFocusedField('discountPercent')}
                                onBlur={() => setFocusedField(null)}
                            />
                            {formSubmitAttempted && !validationErrors.discountPercent.valid && (
                                <Text style={styles(currentColors).errorText}>{validationErrors.discountPercent.message}</Text>
                            )}
                        </View>

                        <View style={styles(currentColors).inputContainer}>
                            <Text style={styles(currentColors).label}>Discount Amount</Text>
                            <TextInput
                                style={getInputStyle('discount')}
                                value={discount}
                                onChangeText={handleDiscountChange}
                                keyboardType="numeric"
                                placeholder="0"
                                onFocus={() => setFocusedField('discount')}
                                onBlur={() => setFocusedField(null)}
                            />
                            {formSubmitAttempted && !validationErrors.discount.valid && (
                                <Text style={styles(currentColors).errorText}>{validationErrors.discount.message}</Text>
                            )}
                        </View>
                    </View>

                    <Text style={styles(currentColors).label}>Services</Text>
                    <View style={[
                        styles(currentColors).pickerContainer,
                        focusedField === 'services' && styles(currentColors).pickerFocused,
                        formSubmitAttempted && !validationErrors.services.valid && styles(currentColors).pickerError
                    ]}>
                        <Picker
                            ref={pickerRef}
                            selectedValue=""  // Always keep it empty to allow reselection
                            onValueChange={handleServiceChange}
                            onFocus={() => {
                                fetchDoctors();
                                setFocusedField('services');
                            }}
                            onBlur={() => setFocusedField(null)}
                            style={styles(currentColors).picker}
                        >
                            <Picker.Item label="Select Service" value="" />
                            {getAvailableServices().map((service) => (
                                <Picker.Item
                                    key={service.serviceName}
                                    label={service.serviceName}
                                    value={service.serviceName}
                                />
                            ))}
                        </Picker>
                    </View>
                    {formSubmitAttempted && !validationErrors.services.valid && (
                        <Text style={styles(currentColors).errorText}>{validationErrors.services.message}</Text>
                    )}

                    {selectedServicesDetails.length > 0 && (
                        <View style={styles(currentColors).selectedServicesContainer}>
                            <Text style={styles(currentColors).selectedServicesTitle}>Selected Services:</Text>
                            {selectedServicesDetails.map((service) => (
                                <View key={service.serviceName} style={styles(currentColors).selectedServiceItem}>
                                    <Text style={styles(currentColors).selectedServiceText}>{service.serviceName}</Text>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveService(service.serviceName)}
                                        style={styles(currentColors).removeServiceButton}
                                    >
                                        <Text style={styles(currentColors).removeServiceText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}


                    <View style={styles(currentColors).inputRow}>
                        <View style={styles(currentColors).inputContainer}>
                            <Text style={styles(currentColors).label}>Payable Fee</Text>
                            <TextInput
                                style={[styles(currentColors).input, { backgroundColor: currentColors.dropdownBackground }]}
                                value={calculatePayableFee()}
                                editable={false}
                                placeholder="1000"
                            />
                        </View>

                        <View style={styles(currentColors).inputContainer}>
                            <TouchableOpacity
                                style={styles(currentColors).saveButton}
                                onPress={handleSave}
                            >
                                <Text style={styles(currentColors).saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = (currentColors: Colors) => StyleSheet.create({
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
        maxWidth: moderateScale(500),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateScale(20),
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: currentColors.actionMenuTextColor,
    },
    closeButton: {
        padding: moderateScale(5),
    },
    closeButtonText: {
        fontSize: moderateScale(22),
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
        fontWeight: '500',
    },
    input: {
        borderWidth: moderateScale(1),
        borderColor: currentColors.dropdownBorder,
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        backgroundColor: currentColors.dropdownBackground,
        fontSize: moderateScale(14),
        color: currentColors.actionMenuTextColor,
    },
    pickerContainer: {
        borderWidth: moderateScale(1),
        borderColor: currentColors.dropdownBorder,
        borderRadius: moderateScale(8),
        backgroundColor: currentColors.dropdownBackground,
        marginBottom: moderateScale(10),
    },
    picker: {
        height: moderateScale(50),
        width: '100%',
        color: currentColors.actionMenuTextColor,
    },
    saveButton: {
        backgroundColor: currentColors.activeTabBackground,
        padding: moderateScale(12),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        marginTop: moderateScale(23),
        justifyContent: 'center',
    },
    saveButtonText: {
        color: currentColors.activeTabText,
        fontSize: moderateScale(14),
        fontWeight: '600',
    },

    selectedServicesContainer: {
        marginTop: moderateScale(14),
        marginBottom: moderateScale(16),
        padding: moderateScale(8),
        backgroundColor: currentColors.dropdownBackground,
        borderRadius: moderateScale(8),
    },
    selectedServicesTitle: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        marginBottom: moderateScale(8),
        color: currentColors.actionMenuTextColor,
    },
    selectedServiceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: currentColors.background,
        padding: moderateScale(8),
        marginBottom: moderateScale(4),
        borderRadius: moderateScale(4),
        borderWidth: moderateScale(1),
        borderColor: currentColors.dropdownBorder,
    },
    selectedServiceText: {
        flex: 1,
        fontSize: moderateScale(14),
        color: currentColors.actionMenuTextColor,
    },
    removeServiceButton: {
        padding: moderateScale(4),
        marginLeft: moderateScale(8),
    },
    removeServiceText: {
        color: 'red',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    doctorDetailsContainer: {
        marginTop: moderateScale(8),
        marginBottom: moderateScale(16),
        padding: moderateScale(8),
        backgroundColor: currentColors.dropdownBackground,
        borderRadius: moderateScale(8),
    },
    doctorName: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        marginBottom: moderateScale(8),
        color: currentColors.actionMenuTextColor,
    },
    servicesTitle: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        marginBottom: moderateScale(8),
        color: currentColors.actionMenuTextColor,
    },
    serviceItem: {
        fontSize: moderateScale(14),
        color: currentColors.actionMenuTextColor,
        marginBottom: moderateScale(4),
    },
    inputFocused: {
        borderColor: '#0066FF',
        borderWidth: moderateScale(1),
    },
    inputError: {
        borderColor: 'red',
        borderWidth: moderateScale(1),
    },
    pickerFocused: {
        borderColor: '#0066FF',
        borderWidth: moderateScale(1),
    },
    pickerError: {
        borderColor: 'red',
        borderWidth: moderateScale(1),
    },
    errorText: {
        color: 'red',
        fontSize: moderateScale(12),
        marginTop: moderateScale(2),
        marginBottom: moderateScale(5),
    },
});

export default EditAppointmentModal;