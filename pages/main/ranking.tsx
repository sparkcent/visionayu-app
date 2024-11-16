import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRoute } from "@react-navigation/native";
import { BASE_URL } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RankingScreen() {
    const searchdata:any = useRoute().params;
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState<any[]>([]);
    const [authToken, setAuthToken] = useState<string | null>(null);
    useEffect(() => {
        const fetchAuthToken = async () => {
            const token = await AsyncStorage.getItem('authToken');
            setAuthToken(token); // Save it to state
        };

        fetchAuthToken();
        fetch(`${BASE_URL}getRanking&id=${searchdata?.examid}`)
            .then(response => response.json())
            .then(data => {
                setRanking(data);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
            });
    }, [searchdata?.examid]);
    const renderItem = ({ item }: { item: any }) => {
        const isCurrentUser = item.user_token === authToken;
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const year = date.getFullYear();
            
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const formattedTime = `${hours}:${minutes} ${ampm}`;
        
            return `${day}-${month}-${year} ${formattedTime}`;
        };
        return (
            <View style={[styles.card, isCurrentUser && styles.highlightCard]}>
                <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{item.ranking}</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.name, isCurrentUser && styles.highlightName]}>
                        {item.fname} {item.lname}
                    </Text>
                    <Text style={styles.marks}>Marks: {item.marks}</Text>
                    <Text style={styles.date}>Submitted: {formatDate(item.submitted)}</Text>
                </View>
            </View>
        );
    }
    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (ranking.length === 0) {
        return (
            <View style={styles.noData}>
                <Text>No rankings available.</Text>
            </View>
        );
    }

    return (
        <View style={{marginBottom:5,flex:1}}>
            <Text style={styles.title}>{searchdata?.title}</Text>
            <FlatList
                data={ranking}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    highlightCard: {
        backgroundColor: '#e0ffe0',
    },
    highlightName: {
        color: "#006400",
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: "#333",
        textAlign: 'center',
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noData: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noDataText: {
        fontSize: 16,
        color: "#888",
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "center",
    },
    rankBadge: {
        backgroundColor: "#6200ee",
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        margin: 16,
    },
    rankText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    cardContent: {
        flex: 1,
        paddingRight: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    marks: {
        fontSize: 14,
        color: "#555",
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
})