import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { Button, Snackbar, TextInput, useTheme } from 'react-native-paper';
import { BASE_URL } from './types';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function ForgotScreen() {
    const { colors } = useTheme();
    const [email, setEmail] = useState({ value: '', error: '' });
    const [otp, setOtp] = useState({ value: '', error: '' });
    const [password, setPassword] = useState({ value: '', error: '' });
    const [confirmPassword, setConfirmPassword] = useState({ value: '', error: '' });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [otpValidated, setOtpValidated] = useState(false);
    const [visible, setVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const onToggleSnackBar = () => setVisible(!visible);
    const onDismissSnackBar = () => setVisible(false);

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
            const response = await fetch(`${BASE_URL}updatePassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.value, password: password.value }),
            });
            const result:any = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }
            if (result.status === 'success') {
                Toast.show({
                    type: 'success',  
                    position: 'top',  
                    text1: 'Forgot Password', 
                    text2: 'Password Updated Successfully', 
                });
                navigation.navigate('Login')
            } else {
                setSnackbarMessage(result.message);
                setVisible(true);
            }
        } catch (error: any) {
            setGeneralError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onOtpPressed = async () => {
        const emailError = emailValidator(email.value);
        if (emailError) {
            setEmail({ ...email, error: emailError });
            return;
        }
        setLoading(true);
        setGeneralError('');
        try {
            const response = await fetch(`${BASE_URL}getOtp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.value }),
            });
            const result:any = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }
            if (result.status === 'success') {
                Toast.show({
                    type: 'success',  
                    position: 'top',  
                    text1: 'Forgot Password', 
                    text2: 'OTP Send on Mail', 
                });
            } else {
                setSnackbarMessage(result.message);
                setVisible(true);
            }
        } catch (error: any) {
            setGeneralError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const onValidatePressed = async () => {
        const emailError = emailValidator(email.value);
        const otpError = otpValidator(otp.value);
        if (emailError || otpError) {
            setEmail({ ...email, error: emailError });
            setOtp({ ...otp, error: otpError });
            return;
        }

        setLoading(true);
        setGeneralError('');

        try {
            const response = await fetch(`${BASE_URL}validateOtp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.value,
                    otp: otp.value
                }),
            });
            const result:any = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }
            if (result.status === 'success') {
                setOtpValidated(true);
            } else {
                setSnackbarMessage(result.message);
                setVisible(true);
            }
        } catch (error: any) {
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

    const otpValidator = (otp: string) => {
        if (otp.length < 4) return 'OTP must be at least 4 characters';
        return '';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Image style={styles.tinyLogo} source={require('../assets/logo.png')} />
            <Text style={{fontSize:18,paddingBottom:20,fontStyle:'italic',fontWeight:'bold'}}>Vision Ayurved</Text>
            <View style={styles.nameContainer}>
                <TextInput
                    mode="outlined"
                    keyboardType='email-address'
                    label="Email Id"
                    value={email.value}
                    onChangeText={(text: any) => setEmail({ value: text, error: '' })}
                    left={<TextInput.Icon icon="email" />}
                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                    error={!!email.error}
                />
            </View>
            {!otpValidated ? (
                <>
                    <View style={styles.nameContainer}>
                        <TextInput
                            mode="outlined"
                            keyboardType='numeric'
                            label="OTP"
                            value={otp.value}
                            onChangeText={(text: any) => setOtp({ value: text, error: '' })}
                            left={<TextInput.Icon icon="lastpass" />}
                            style={[styles.input, { backgroundColor: theme.colors.surface}]}
                            error={!!otp.error}
                        />
                    </View>
                    <View style={[styles.nameContainer, { justifyContent: 'flex-end' }]}>
                        <Button mode="text" onPress={onOtpPressed}>GET OTP</Button>
                    </View>
                    <Button
                        style={[styles.button]}
                        icon={loading ? 'loading' : 'login'}
                        mode="contained"
                        onPress={onValidatePressed}>
                        {loading ? 'CHECKING...' : 'VALIDATE OTP'}
                    </Button>
                </>
            ) : (
                <>
                    <View style={styles.nameContainer}>
                        <TextInput
                            mode="outlined"
                            secureTextEntry={!passwordVisible}
                            label="Password"
                            value={password.value}
                            onChangeText={(text: any) => setPassword({ value: text, error: '' })}
                            left={<TextInput.Icon icon="lock" />}
                            right={ <TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(!passwordVisible)} /> }
                            error={!!password.error}
                            style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        />
                    </View>
                    <View style={styles.nameContainer}>
                        <TextInput
                            mode="outlined"
                            secureTextEntry={!passwordVisible}
                            label="Confirm Password"
                            value={confirmPassword.value}
                            onChangeText={(text: any) => setConfirmPassword({ value: text, error: '' })}
                            left={<TextInput.Icon icon="lock" />}
                            right={
                                <TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(!passwordVisible)} />
                            }
                            error={!!confirmPassword.error}
                            style={[styles.input, { backgroundColor: theme.colors.surface }]}
                        />
                    </View>
                    <Button style={[styles.button]} icon={loading ? 'loading' : 'login'} mode="contained" onPress={onLoginPressed} >
                        {loading ? 'UPDATING...' : 'FORGOT PASSWORD'}
                    </Button>
                </>
            )}

            <Snackbar visible={visible} onDismiss={onDismissSnackBar} action={{ label: 'Close', onPress: onDismissSnackBar }}>
                {snackbarMessage}
            </Snackbar>

            <TouchableOpacity style={styles.backToLoginContainer} onPress={() => navigation.navigate('Login')}>
                <View style={styles.hrLine} />
                <Text style={[styles.backToLoginText, { color: colors.onSurface }]}>Back To Login</Text>
                <View style={styles.hrLine} />
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
        marginTop: 10,
    },
    nameContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    nameInput: {
        flex: 1,
    },
    backToLoginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    hrLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#000',
    },
    backToLoginText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        fontStyle: 'italic',
        marginHorizontal: 10,
    },
});