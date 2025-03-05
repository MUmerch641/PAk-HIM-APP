// VerificationScreen.tsx
import { verifyToken } from '@/src/Auth/authService';
import React, { useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import Toast from 'react-native-toast-message'; // Import Toast

interface VerificationScreenProps {
    email?: string;
    onSubmit?: (token: string) => void; // Modify prop to pass token
    onResend?: () => void;
    onBackToEmail?: () => void; // Add prop for back to email
    onVerificationSuccess?: (token: string) => void; // Modify prop to pass token
}

const VERIFICATION_CODE_LENGTH = 6;

// Define the scaling functions
const width = 375; // Example width, replace with your design's base width
const height = 812; // Example height, replace with your design's base height
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number): number => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number): number => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor: number = 0.5): number =>
    size + (scale(size) - size) * factor;

const VerificationScreen: React.FC<VerificationScreenProps> = ({
    email = "example@Gmail.Com",
    onSubmit,
    onResend,
    onBackToEmail, // Add prop for back to email
    onVerificationSuccess, // Modify prop to pass token
}) => {
    const [code, setCode] = useState<string[]>(Array(VERIFICATION_CODE_LENGTH).fill(''));
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [showError, setShowError] = useState<boolean[]>(Array(VERIFICATION_CODE_LENGTH).fill(false));
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus next input
        if (text && index < VERIFICATION_CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Remove error if field is filled
        if (text) {
            const newShowError = [...showError];
            newShowError[index] = false;
            setShowError(newShowError);
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newCode = [...code];
            newCode[index - 1] = '';
            setCode(newCode);
        }
    };
    const handleSubmit = async () => {
        const completeCode = code.join('');

        const newShowError = code.map((value) => !value);
        setShowError(newShowError);

        if (newShowError.some((value) => value)) {
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: 'Please fill all fields',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await verifyToken(email, completeCode);


            // Check isSuccess instead of status
            if (response.isSuccess && response.data.isTokenVerified) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: response.message || 'Verification code confirmed',
                    position: 'top',
                    visibilityTime: 3000,
                });

                onVerificationSuccess?.(completeCode); // Pass the token to the callback
                onSubmit?.(completeCode); // Pass the token to the callback
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Verification Failed',
                    text2: response.message || 'Invalid verification code',
                    position: 'top',
                    visibilityTime: 3000,
                });

                setCode(Array(VERIFICATION_CODE_LENGTH).fill(''));
                inputRefs.current[0]?.focus();
            }
        } catch (error: any) {
            console.error('Verification error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to verify code. Please try again.',
                position: 'top',
                visibilityTime: 3000,
            });

            setCode(Array(VERIFICATION_CODE_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.content}>
                    <Text numberOfLines={1} style={styles.title}>Second Step Verifications!</Text>
                    <Text style={styles.subtitle}>
                        Enter The Verification Code We Sent To {email}
                    </Text>
                    <Text style={styles.inputLabel}>Type Your Code Here</Text>
                    <View style={styles.codeContainer}>
                        {Array(VERIFICATION_CODE_LENGTH).fill(0).map((_, index) => (
                            <View key={index} style={{ flexDirection: 'row' }}>
                                <TextInput
                                    ref={(ref) => inputRefs.current[index] = ref}
                                    value={code[index]}
                                    onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                    onFocus={() => setFocusedIndex(index)}
                                    onBlur={() => setFocusedIndex(null)}
                                    style={[
                                        styles.codeInput,
                                        focusedIndex === index && styles.codeInputFocused,
                                        showError[index] && styles.codeInputError,
                                    ]}
                                    onSubmitEditing={handleSubmit}
                                />
                                {index === 2 && <View style={styles.spaceBetweenInputs} />}
                            </View>
                        ))}
                    </View>

                    <View style={{ paddingHorizontal: scale(10) }}></View>
                    {onBackToEmail && (
                        <TouchableOpacity onPress={onBackToEmail}>
                            <Text style={styles.backToLoginText}>Back to Email</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" /> // Show activity indicator while loading
                        ) : (
                            <Text style={styles.submitButtonText}>Submit →</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>{"Didn't Get The Code? "}</Text>
                    <TouchableOpacity onPress={onResend}>
                        <Text style={styles.resendLink}>Resend</Text>
                    </TouchableOpacity>
                </View>

                <Toast />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        // paddingHorizontal: scale(20),
        // paddingTop: verticalScale(20),
    },
    title: {
        textAlign: 'center',
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#055FFC',
        marginBottom: verticalScale(10),
    },
    subtitle: {
        fontSize: moderateScale(12),
        color: '#666',
        marginBottom: verticalScale(15),
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: moderateScale(14),
        color: '#333',
        marginBottom: verticalScale(16),
        alignSelf: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: scale(6),
        marginBottom: verticalScale(22),
    },
    codeInput: {
        width: scale(40),
        // height: scale(45),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: moderateScale(5),
        textAlign: 'center',
        fontSize: moderateScale(20),
        color: '#333',
        backgroundColor: '#fff',
    },
    codeInputFocused: {
        borderColor: '#055FFC',
    },
    codeInputError: {
        borderColor: 'red',
    },
    spaceBetweenInputs: {
        width: scale(15), // Adjust the space between 3rd and 4th input
    },
    submitButton: {
        backgroundColor: '#055FFC',
        height: verticalScale(45),
        borderRadius: moderateScale(5),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(32),
        width: '100%',
        marginBottom: verticalScale(16),
    },
    submitButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resendText: {
        fontSize: moderateScale(14),
        color: '#333',
    },
    resendLink: {
        fontSize: moderateScale(14),
        color: '#055FFC',
        fontWeight: '500',
    },
    backToLoginText: {
        marginBottom: verticalScale(16),
        color: '#055FFC',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
});

export default VerificationScreen;