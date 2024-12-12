import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackActions, useNavigation } from '@react-navigation/native';
import { BASE_URL } from './types';
import Toast from 'react-native-toast-message';
export default function LoginScreen() {
    const { colors } = useTheme();
    const [email, setEmail] = useState({ value: '', error: '' });
    const [password, setPassword] = useState({ value: '', error: '' });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const navigation = useNavigation<any>();

    const onLoginPressed = async () => {
        const emailError = emailValidator(email.value);
        const passwordError = passwordValidator(password.value);
        if (emailError || passwordError) {
            setEmail({ ...email, error: emailError });
            setPassword({ ...password, error: passwordError });
            return;
        }

        setLoading(true);
        setGeneralError('');
        try {
            const response = await fetch(`${BASE_URL}checkUser`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email.value, password: password.value }),
            });
          
            if (!response.ok) {
              throw new Error('Failed to authenticate. Please try again.');
            }
          
            const result = await response.json();
            if (result.status === 'failed') {
              Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Login Failed',
                text1Style:{fontSize:19},
                text2: result.message,
                text2Style:{fontSize:15},
              });
              return;
            }
          
            await Promise.all([
              AsyncStorage.setItem('authToken', result.token),
              AsyncStorage.setItem('authName', result.name),
            ]);

            const storedToken = await AsyncStorage.getItem('authToken');
            if (storedToken) {
                navigation.replace('HomeScreen');
            } else {
              Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Login Issue',
                text2: 'Unable to verify token. Please try to login again.',
              });
            }
        } catch (error:any) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Login Failed',
                text1Style:{fontSize:19},
                text2: error.message || 'Something went wrong',
            });
            setGeneralError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const emailValidator = (email: string) => {
        if (!email.includes('@')) return 'Invalid email address';
        return '';
    };

    const passwordValidator = (password: string) => {
        if (password.length < 6) return 'Password must be at least 6 characters';
        return '';
    };
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Image style={styles.tinyLogo} source={require('../assets/logo.png')} />
            <Text style={{ fontSize: 18, paddingBottom: 20, fontStyle: 'italic', fontWeight: 'bold' }}>Vision Ayurved</Text>
            <TextInput
                mode="outlined"
                keyboardType="email-address"
                label="Email Id"
                value={email.value}
                onChangeText={(text) => setEmail({ value: text.toLowerCase(), error: '' })}
                left={<TextInput.Icon icon="email" />}
                style={[styles.input, { backgroundColor: colors.surface }]}
                error={!!email.error}
            />
            <TextInput
                mode="outlined"
                secureTextEntry={!passwordVisible}
                label="Password"
                value={password.value}
                onChangeText={(text) => setPassword({ value: text, error: '' })}
                left={<TextInput.Icon icon="lock" />}
                right={
                    <TextInput.Icon
                        icon={passwordVisible ? "eye-off" : "eye"}
                        onPress={() => setPasswordVisible(!passwordVisible)}
                    />
                }
                error={!!password.error}
                style={[styles.input, { backgroundColor: colors.surface }]}
            />
            <TouchableOpacity style={{ width: '100%', marginBottom: 20 }} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={{ textAlign: 'right', fontSize: 16, color: colors.onSurface }}>Forgot password?</Text>
            </TouchableOpacity>
            <Button
                style={[styles.button]}
                icon={loading ? 'loading' : 'login'}
                mode="contained"
                onPress={onLoginPressed}
                loading={loading}
            >
                {loading ? 'SIGNING...' : 'LOGIN'}
            </Button>
            <TouchableOpacity 
                style={{ width: '100%', marginTop: 20 }} 
                onPress={() => navigation.navigate('Registration')}>
                <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '600', fontStyle: 'italic', color: colors.onSurface }}>
                    Not registered? Create an Account
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        width: '100%',
    },
    input: {
        width: '100%',
        marginBottom: 16,
    },
    error: {
        marginBottom: 16,
    },
    tinyLogo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    button: {
        width: '70%',
        padding: 2,
    },
});
