
import React, { useEffect, useState } from "react";
import { Text, View, Image, ImageBackground, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, useTheme } from "react-native-paper";
import { BASE_URL } from "../types";
export default function ProfileScreen() {
    const [name, setName] = useState('');
    const {colors} = useTheme();
    const [loading, setLoading] = useState(true);
    const [fname, setFname] = useState({ value: '', error: '' });
    const [lname, setLname] = useState({ value: '', error: '' });
    const [email, setEmail] = useState({ value: '', error: '' });
    const [whatsapp, setWhatsApp] = useState({ value: '', error: '' });
    useEffect(() => {
        const fetchName = async () => {
            const storedName = await AsyncStorage.getItem('authName');
            const token = await AsyncStorage.getItem('authToken');
            if (storedName !== null) {
                setName(storedName);
            }
            const response = await fetch(`${BASE_URL}getProfile&token=${token}`);
            const datanew = await response.json();
            let data = datanew[0];
            if (data) {
                setFname({value:data.fname,error:''});
                setLname({value:data.lname,error:''});
                setEmail({value:data.email,error:''});
                setWhatsApp({value:data.mobile,error:''});
                setLoading(false);
            } else {
                setLoading(false);
            }
        };
        
        fetchName();
    }, []);

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <ImageBackground source={require('../../assets/logo.png')} style={styles.profimageBackground} imageStyle={styles.imageWithOpacity} >
                    <View style={styles.headerContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.name,{color:'white'}]}>Welcome</Text>
                            <Text style={styles.userInfo}>{name}</Text>
                        </View>
                        <View>
                            <Image style={styles.avatar} source={require("../../assets/profile.png")} />
                        </View>
                    </View>
                </ImageBackground>
            </View>
            <View style={[styles.nameContainer,{marginTop:10}]}>
                <TextInput editable={false} mode="outlined" keyboardType='ascii-capable' label="First Name" autoCapitalize='characters' value={fname.value} onChangeText={(text) => setFname({ value: text.toUpperCase(), error: '' })} left={<TextInput.Icon icon="account" />} style={[styles.input, styles.nameInput, { backgroundColor: colors.surface, marginRight: 8 }]} error={!!fname.error} />
                <TextInput editable={false} mode="outlined" keyboardType='ascii-capable' label="Last Name" autoCapitalize='characters' value={lname.value} onChangeText={(text) => setLname({ value: text.toUpperCase(), error: '' })} left={<TextInput.Icon icon="account" />} style={[styles.input, styles.nameInput, { backgroundColor: colors.surface, marginLeft: 8 }]} error={!!lname.error} />
            </View>
            <View style={styles.nameContainer}>
                <TextInput editable={false} mode="outlined" keyboardType='phone-pad' label="WhatsApp No." value={whatsapp.value} onChangeText={(text) => setWhatsApp({ value: text, error: '' })} left={<TextInput.Icon icon="cellphone" />} style={[styles.input, { backgroundColor: colors.surface }]} error={!!whatsapp.error} />
            </View>
            <View style={styles.nameContainer}>
                <TextInput editable={false} mode="outlined" keyboardType='email-address' label="Email Id" value={email.value} onChangeText={(text) => setEmail({ value: text.toLowerCase(), error: '' })} left={<TextInput.Icon icon="email" />} style={[styles.input, { backgroundColor: colors.surface }]} error={!!email.error} />
            </View>
      </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 8, backgroundColor: '#f0f0f0' },
    nameContainer: {flexDirection: 'row',width: '100%',justifyContent: 'space-between',},
    header: { height: 200, backgroundColor:'gray' },
    avatar: {width: 100,height: 100,borderRadius: 63,borderWidth: 2,borderColor: "white",marginBottom: 10,},
    profimageBackground: { flex: 1, backgroundColor:'gray' },
    headerContent: {padding: 30,alignItems: "center",display: "flex",flex: 1,flexDirection: "row",flexWrap: "wrap"},
    name: {fontSize: 22,color: "black",fontWeight: "600"},
    userInfo: {fontSize: 20,color: "white",fontWeight: "600"},
    input: { width: '100%', marginBottom: 10 },
    imageWithOpacity: { opacity: 0.1 },
    nameInput: {flex: 1,},
})