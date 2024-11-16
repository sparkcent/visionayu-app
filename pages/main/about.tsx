import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import SwiperFlatList from 'react-native-swiper-flatlist';
import { BASE_URL, MAIN_URL } from '../types';

const { width } = Dimensions.get('window');
const colors = ['tomato', 'thistle', 'skyblue', 'teal'];
export default function AboutScreen() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const response = await fetch(`${BASE_URL}doctorsList`);
            const result = await response.json();
            setData(result);
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
        };
        fetchData();
    }, []);

    if (loading) {
        return <View style={[styles.container,{justifyContent:'center'}]}>
            <ActivityIndicator size={100} animating={true} />
        </View>;
    }
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image style={styles.logo} source={require('../../assets/logo.png')} />
            <Text style={styles.title}>About Us</Text>
            <View style={{ flex: 1 }}>
            <SwiperFlatList
                    autoplay
                    autoplayDelay={2}
                    autoplayLoop
                    showPagination
                    index={0}
                    data={data}
                    renderItem={({ item }) => (
                        <View style={styles.child}>
                            <View style={styles.tabmainContainer}>
                                <Image source={{ uri: MAIN_URL+item.photo }} style={styles.swiperImage} />
                                <Text style={styles.swiperText}>Name: {item.name}</Text>
                                <Text style={styles.swiperText}>Degree: {item.degree}</Text>
                                <Text style={styles.swiperText}>Contact: {item.number}</Text>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
            <View style={{ padding: 20 }}>
            <Text style={styles.description}>
            Vision Ayurved Academy has been established on 29th February 2016. We are the first institute to provide complete syllabus based online videos at one platform.
            </Text>
            <Text style={styles.subtitle}>Our Mission</Text>
            <Text style={styles.description}>
            The first and foremost motive to established this Academy is to serve, transfer and share the knowledge of ancient
            </Text>
            <Text style={styles.subtitle}>Our Vision</Text>
            <Text style={styles.description}>
            To establish one full flash and nearby centre for the preparation of entrance examination to all the students.
            </Text>
            <Text style={styles.subtitle}>Contact Us</Text>
            <Text style={styles.description}>
                Address: Near Orange City Hospital, Tatya Tope Nagar, Vivekanand Nagar, Nagpur, Maharashtra 440022
            </Text>
            <Text style={styles.description}>
                Phone: 7276885293   9561784087  8600683786
            </Text>
            <Text style={styles.description}>
                Email: info@visionayunagpur.com
            </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    child: { width, justifyContent: 'center',alignContent:'center',textAlign:'center',padding:15 },
    text: { fontSize: width * 0.5, textAlign: 'center' },
    swiperImage: {
        width: 150,
        height: 150,
        textAlign:'center',
        margin:'auto',
        padding:50,
        marginBottom: 10,
        marginTop: 10,
    },
    tabmainContainer:{
        backgroundColor:'#ebebeb',
        elevation: 3,
        marginBottom:10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    swiperText: {
        fontSize: 16,
        color: 'black',
        marginBottom: 5,
        textAlign: 'center',
    },
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
    },
    logo: {
        width: 150,
        height: 150,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color:'black'
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        color:'black',
        marginTop: 15,
        marginBottom: 5,
    },
    description: {
        fontSize: 16,
        color:'black',
        lineHeight: 24,
        marginBottom: 10,
    },
});
