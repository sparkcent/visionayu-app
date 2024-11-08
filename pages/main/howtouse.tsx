import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image } from 'react-native';
import Video from 'react-native-video';
import { BASE_URL, MAIN_URL } from '../types';

interface VideoItem {
    id: string;
    name: string;
    video: string;
}

export default function HowToUseScreen() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(`${BASE_URL}howtouse`);
                const data: VideoItem[] = await response.json();
                setVideos(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch videos');
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text>{error}</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: VideoItem }) => {
        

        const handleLoadStart = () => {
            setIsLoading(true);
            setHasError(false);
        };

        const handleLoad = () => {
            setIsLoading(false);
        };

        const handleError = () => {
            setIsLoading(false);
            setHasError(true);
        };

        return (
            <View style={styles.videoContainer}>
                {isLoading && !hasError && (
                    <ActivityIndicator style={styles.loadingIndicator} size="large" color="#0000ff" />
                )}
                {hasError && (
                    <Text style={styles.errorText}>Failed to load video</Text>
                )}
                {item.video && !hasError ? (
                    <Video
                        source={{ uri: `${MAIN_URL}${item.video}` }}
                        style={styles.video}
                        controls={true}
                        paused={true}
                        resizeMode="contain"
                        onLoadStart={handleLoadStart}
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                ) : (
                    <Text>No video available</Text>
                )}
                <Text style={styles.videoName}>{item.name}</Text>
            </View>
        );
    };

    return (
        <FlatList
            data={videos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 10,
    },
    videoContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    videoName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'left',
        color:'black'
    },
    video: {
        width: '100%',
        height: 200,
        backgroundColor: '#000',
    },
    loadingIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
});
