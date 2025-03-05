import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: boolean;
  showError?: boolean;
}

const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;
const scale = (size: number): number => width / guidelineBaseWidth * size;
const verticalScale = (size: number): number => height / guidelineBaseHeight * size;
const moderateScale = (size: number, factor: number = 0.5): number => size + (scale(size) - size) * factor;

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  showError,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            { borderColor: error ? 'red' : isFocused ? '#055FFC' : '#E0E0E0' },
          ]}
          placeholder={placeholder}
          placeholderTextColor="#aaa" // Added placeholder text color
          value={value}
          onChangeText={handleChangeText}
          secureTextEntry={isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={24}
              color="#aaa9a94e"
            />
          </TouchableOpacity>
        )}
      </View>
      {showError && error && <Text style={styles.requiredText}>Required</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(14),
    color: '#333',
    marginBottom: verticalScale(8),
    fontWeight: 'bold', // Added bold text
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: verticalScale(40),
    width: scale(40),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: moderateScale(5),
    paddingHorizontal: scale(12),
    fontSize: moderateScale(14),
    backgroundColor: '#fff',
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: scale(16),
  },
  requiredText: {
    color: 'red',
    fontSize: moderateScale(10),
    marginTop: verticalScale(4),
  },
});

export default Input;