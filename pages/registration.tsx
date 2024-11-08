import * as React from 'react';
import { useMemo, useState } from 'react';
import { View, StyleSheet, Image, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Icon, Snackbar, TextInput, useTheme } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './types';
import { useData } from './DataContext';
import { useNavigation } from '@react-navigation/native';

export default function RegistrationScreen() {
    const { colors } = useTheme();
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [visible, setVisible] = React.useState(false);
    const onDismissSnackBar = () => setVisible(false);

    const [fname, setFname] = useState({ value: '', error: '' });
    const [lname, setLname] = useState({ value: '', error: '' });
    const [email, setEmail] = useState({ value: '', error: '' });
    const [whatsapp, setWhatsApp] = useState({ value: '', error: '' });
    const [collage, setCollage] = useState({ value: '', error: '' });
    const [password, setPassword] = useState({ value: '', error: '' });
    const [state, setState] = useState({ value: '', error: '' });
    const [city, setCity] = useState({ value: '', error: '' });
    const [isFocus, setIsFocus] = useState(false);
    const [iscityFocus, setcityIsFocus] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const { stateList, cityList } = useData();
    const navigation = useNavigation<any>();
    const filteredCityList = useMemo(() => {
        if (!state.value) return cityList;
        return cityList.filter(city => city.state_id === state.value);
    }, [state.value, cityList]);
    
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
            const response = await fetch(`${BASE_URL}saveUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fname: fname.value,
                    lname: lname.value,
                    whatsapp: whatsapp.value,
                    email: email.value,
                    password: password.value,
                    collage: collage.value,
                    state: state.value,
                    city: city.value,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }
            if (result.status === 'success') {
                await AsyncStorage.setItem('userToken', result.token);
                await AsyncStorage.setItem('authName', result.name);
                navigation.navigate('HomeScreen');
            } else {
                setLoading(false);
                setSnackbarMessage(result.message);
                setVisible(true)
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
        if (password.length < 4) return 'Password must be at least 6 characters';
        return '';
    };

    const renderLabel = () => {
        if (state.value || isFocus) {
            return (<Text style={[styles.label, isFocus && { color: 'blue' }]}>UG College State</Text>);
        }
        return null;
    };

    const renderCityLabel = () => {
        if (city.value || iscityFocus) {
            return (<Text style={[styles.label, iscityFocus && { color: 'blue' }]}>UG College City</Text>);
        }
        return null;
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Image style={styles.tinyLogo} source={require('../assets/logo.png')} />
            <Text style={{fontSize:18,paddingBottom:20,fontStyle:'italic',fontWeight:'bold'}}>Vision Ayurved</Text>
            <View style={styles.nameContainer}>
                <TextInput mode="outlined" keyboardType='ascii-capable' label="First Name" autoCapitalize='characters' value={fname.value}
                    onChangeText={(text) => setFname({ value: text.toUpperCase(), error: '' })}
                    left={<TextInput.Icon icon="account" />}
                    style={[styles.input, styles.nameInput, { backgroundColor: colors.surface, marginRight: 8 }]}
                    error={!!fname.error} />
                <TextInput mode="outlined" keyboardType='ascii-capable' label="Last Name" autoCapitalize='characters' value={lname.value}
                    onChangeText={(text) => setLname({ value: text.toUpperCase(), error: '' })}
                    left={<TextInput.Icon icon="account" />}
                    style={[styles.input, styles.nameInput, { backgroundColor: colors.surface, marginLeft: 8 }]}
                    error={!!lname.error}
                />
            </View>
            <View style={styles.nameContainer}>
                <TextInput mode="outlined" keyboardType='phone-pad' label="WhatsApp No." value={whatsapp.value} onChangeText={(text) => setWhatsApp({ value: text, error: '' })} left={<TextInput.Icon icon="cellphone" />} style={[styles.input, { backgroundColor: colors.surface }]} error={!!whatsapp.error} />
            </View>
            <View style={styles.nameContainer}>
                <TextInput mode="outlined" keyboardType='email-address' label="Email Id" value={email.value} onChangeText={(text) => setEmail({ value: text.toLowerCase(), error: '' })} left={<TextInput.Icon icon="email" />} style={[styles.input, { backgroundColor: colors.surface }]} error={!!email.error} />
            </View>
            <View style={styles.nameContainer}>
                <TextInput
                    mode="outlined"
                    secureTextEntry={!passwordVisible}
                    label="Password"
                    value={password.value}
                    onChangeText={(text) => setPassword({ value: text, error: '' })}
                    left={<TextInput.Icon icon="lock" />}
                    right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(!passwordVisible)} />}
                    error={!!password.error}
                    style={[styles.input, { backgroundColor: colors.surface }]}
                />
            </View>
            <View style={styles.nameContainer}>
                <TextInput
                    mode="outlined"
                    keyboardType='ascii-capable'
                    label="UG College Name"
                    value={collage.value}
                    onChangeText={(text) => setCollage({ value: text, error: '' })}
                    left={<TextInput.Icon icon="school" />}
                    style={[styles.input, { backgroundColor: colors.surface }]}
                    error={!!collage.error}
                />
            </View>

            <View style={[styles.nameContainer, { top: 5 }]}>
                {renderLabel()}
                <Dropdown
                    style={[styles.dropdown]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={stateList}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'UG Collage State' : '...'}
                    searchPlaceholder="Search..."
                    value={state.value}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item: any) => {
                        setState(item);
                        setCity({ value: '', error: '' });
                        setIsFocus(false);
                    }}
                    renderLeftIcon={() => (<Icon source="school" size={20} />)}
                />
            </View>
            <View style={[styles.nameContainer, { top: 20 }]}>
                {renderCityLabel()}
                <Dropdown
                    style={[styles.dropdown]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={filteredCityList}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!iscityFocus ? 'UG Collage City' : '...'}
                    searchPlaceholder="Search..."
                    value={city.value}
                    onFocus={() => setcityIsFocus(true)}
                    onBlur={() => setcityIsFocus(false)}
                    onChange={(item: any) => {setCity(item);setcityIsFocus(false);}}
                    renderLeftIcon={() => (<Icon source="school" size={20} />)}
                />
            </View>
            <Button style={[styles.button]} icon={loading ? 'loading' : 'login'} loading={loading ? true : false} mode="contained" onPress={onLoginPressed}>{loading ? 'SIGNING UP...' : 'REGISTER'}</Button>
            <Snackbar style={styles.snackbarContainer} visible={visible} onDismiss={onDismissSnackBar}action={{ label: 'Close', onPress: () => {} }}>{snackbarMessage}</Snackbar>
            <TouchableOpacity style={{ width: '100%', marginTop: 30 }} onPress={() => navigation.navigate('Login')}>
                <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '600', fontStyle: 'italic', color: colors.onSurface }}>
                    Already have an Account? Back To Login
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flexGrow: 1,alignItems: 'center',padding: 16,width: '100%',backgroundColor:'white'},
    nameContainer: {flexDirection: 'row',width: '100%',justifyContent: 'space-between',},
    nameInput: {flex: 1,},
    input: {width: '100%',marginBottom: 10,},
    tinyLogo: {width: 150,height: 150},
    button: {width: '70%',marginTop: 60,},
    dropdown: {height: 50,width: '100%',borderColor: 'black',borderWidth: 0.6,borderRadius: 6,paddingHorizontal: 15,},
    icon: {marginRight: 5,},
    label: {position: 'absolute',backgroundColor: 'white',left: 8,top: -5,zIndex: 999,paddingHorizontal: 5,fontSize: 12,},
    placeholderStyle: {fontSize: 16,left:15},
    selectedTextStyle: {fontSize: 16,left: 15,},
    iconStyle: {width: 20,height: 20,},
    inputSearchStyle: {height: 40,fontSize: 16 },
    snackbarContainer: { zIndex: 1000 },
});