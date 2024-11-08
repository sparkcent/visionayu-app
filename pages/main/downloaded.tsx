import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import { Icon, IconButton } from 'react-native-paper';

interface DownloadedVideo {
    id: string;
    uri: string;
}

export default function DownloadedVideos() {
    const [videos, setVideos] = useState<DownloadedVideo[]>([]);
    const [currentVideo, setCurrentVideo] = useState<DownloadedVideo | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<any>(null);

    useEffect(() => {
        fetchDownloadedVideos();
    }, []);

    const fetchDownloadedVideos = async () => {
        const savedVideos = await AsyncStorage.getItem('downloadedVideos');
        if (savedVideos) {
            const parsedVideos = JSON.parse(savedVideos) as { [id: string]: string };
            const videoArray = Object.keys(parsedVideos).map(id => ({
                id,
                uri: parsedVideos[id],
            }));
            setVideos(videoArray);
            if (videoArray.length > 0) {
                setCurrentVideo(videoArray[0]);
            }
        }
    };

    const handleDeleteVideo = async (id: string) => {
        Alert.alert(
            "Delete Video",
            "Are you sure you want to delete this video?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        const savedVideos = await AsyncStorage.getItem('downloadedVideos');
                        if (savedVideos) {
                            const parsedVideos = JSON.parse(savedVideos) as { [id: string]: string };
                            delete parsedVideos[id];
                            await AsyncStorage.setItem('downloadedVideos', JSON.stringify(parsedVideos));

                            setVideos(prevVideos => prevVideos.filter(video => video.id !== id));

                            if (currentVideo?.id === id) {
                                setCurrentVideo(null);
                                setIsPlaying(false);
                            }
                        }
                    }
                }
            ]
        );
    };

    const renderVideoItem = ({ item }: { item: DownloadedVideo }) => (
        <View style={styles.videoItem}>
            <Text style={styles.videoItemTitle}>Video {item.id}</Text>
            <View style={styles.videoActions}>
                <IconButton icon={isPlaying ? 'pause' : 'play'} size={24} onPress={() => { setIsPlaying((prev) => !prev); }}/>
                <IconButton icon={'delete'} size={24} onPress={() => handleDeleteVideo(item.id)} />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.videoContainer}>
                {currentVideo ? (
                    <Video
                        ref={videoRef}
                        source={{ uri: currentVideo.uri }}
                        resizeMode='contain'
                        style={styles.video}
                        paused={!isPlaying}
                        controls={true}
                    />
                ) : (
                    <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
                )}
            </View>
            <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.videoList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: '#f0f0f0',
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    loadingIndicator: {
        position: 'absolute',
    },
    videoList: {
        paddingBottom: 16,
    },
    videoItem: {
        padding: 12,
        backgroundColor: '#f9f9f9',
        marginBottom: 8,
        borderRadius: 8,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    videoItemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color:'black'
    },
    videoActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playPauseButton: {
        padding: 8,
    },
    deleteButton: {
        padding: 5,
        backgroundColor: '#ffe6e6',
        borderRadius: 4,
    },
});
