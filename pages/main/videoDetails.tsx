import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, MAIN_URL } from '../types';
import Video from 'react-native-video';
import { ActivityIndicator, Icon, IconButton, Menu } from 'react-native-paper';
import Orientation from 'react-native-orientation-locker';
import RNBlobUtil from 'react-native-blob-util';
import { useRoute } from '@react-navigation/native';

export default function VideoDetailsScreen() {
    const searchdata:any = useRoute().params;
    const headerFour = Array.isArray(searchdata.headerFour) ? searchdata.headerFour[0] : searchdata.headerFour;
    const [videoList, setVideoList] = useState<any[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [downloadedUri, setDownloadedUri] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadedVideos, setDownloadedVideos] = useState<any>({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);
    const isFetchCalled = useRef(false);
    const [fullscreen, setFullscreen] = useState(false);
    useEffect(() => {
        const fetchDownloadedVideos = async () => {
            try {
                const savedVideos = JSON.parse(await AsyncStorage.getItem('downloadedVideos') || '{}');
                setDownloadedVideos(savedVideos);
                if (selectedVideo && savedVideos[selectedVideo.id]) {
                    setDownloadedUri(savedVideos[selectedVideo.id]);
                } else {
                    setDownloadedUri('');
                }
            } catch (error) {
                console.error('Failed to fetch downloaded videos:', error);
            }
        };

        fetchDownloadedVideos();
    }, [selectedVideo]);

    useEffect(() => {
        if (isFetchCalled.current) {
            return;
        }
        isFetchCalled.current = true;
        const fetchExams = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const response = await fetch(`${BASE_URL}videoList&headerFour=${headerFour}&token=${token}`);
                console.log(response)
                const result = await response.json();
                if (result && result.length > 0) {
                    setVideoList(result);
                    setSelectedVideo(result[0]);
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };
        disableFullscreen();
        fetchExams();
    }, []);
    const enableFullscreen = () => {
        setFullscreen(false);
        Orientation.lockToLandscape();
    };
    const disableFullscreen = () => {
        setFullscreen(false);
        Orientation.lockToPortrait();
    };
    const handleDownload = async () => {
        setDownloading(true);
        setDownloadProgress(0);
    
        try {
            const uri = MAIN_URL+selectedVideo.uri;
            const filePath = `${RNBlobUtil.fs.dirs.DocumentDir}/${uri}`;
    
            RNBlobUtil.config({
                path: filePath,
            })
            .fetch('GET', uri)
            .progress({ interval: 100 }, (received, total) => {
                const progress = received / total;
                setDownloadProgress(progress);
            })
            .then(async (res) => {
                if (res && res.path()) {
                    setDownloadedUri(res.path());
                    const newDownloadedVideos = { ...downloadedVideos, [selectedVideo.id]: res.path() };
                    setDownloadedVideos(newDownloadedVideos);
                    await AsyncStorage.setItem('downloadedVideos', JSON.stringify(newDownloadedVideos));
                    Alert.alert('Download complete!');
                }
            })
            .catch((error) => {
                console.error('Download failed:', error);
                Alert.alert('Download failed');
            })
            .finally(() => {
                setDownloading(false);
                setDownloadProgress(0);
            });
        } catch (error) {
            console.error('Error during download:', error);
            setDownloading(false);
            setDownloadProgress(0);
        }
    };
    const handleCancelDownload = async () => {
        setDownloading(false);
        setDownloadProgress(0);
        Alert.alert('Download cancelled');
    };

    const handleVideoSelect = async (item: any) => {
        console.log(item)
        setDownloadedUri(downloadedVideos[item.id] || '');
        setSelectedVideo(item);
        setIsPlaying(true);
    };

    const renderVideoItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.videoItem} onPress={() => handleVideoSelect(item)}>
            <Text style={styles.videoItemTitle}>{item.title}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" animating={true} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.videoContainer}>
                <Video
                    resizeMode='contain'
                    style={styles.video}
                    source={{ uri: downloadedUri || MAIN_URL + selectedVideo?.uri }}
                    paused={!isPlaying}
                    controls={true}
                    rate={playbackRate}
                    fullscreen={fullscreen}
                    onFullscreenPlayerWillPresent={() => enableFullscreen()}
                    onFullscreenPlayerWillDismiss={() => disableFullscreen()}
                />
            </View>
            <View style={styles.detailsContainer}>
                    <View style={styles.controlsContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                    <Menu
                        visible={visible}
                        onDismiss={closeMenu}
                        anchor={ <IconButton icon="speedometer" size={24} onPress={openMenu} /> }
                    >
                        <Menu.Item onPress={() => { setPlaybackRate(0.25); closeMenu(); }} title="0.5x" />
                        <Menu.Item onPress={() => { setPlaybackRate(1.0); closeMenu(); }} title="1x" />
                        <Menu.Item onPress={() => { setPlaybackRate(1.25); closeMenu(); }} title="1.25x" />
                        <Menu.Item onPress={() => { setPlaybackRate(1.50); closeMenu(); }} title="1.50x" />
                        <Menu.Item onPress={() => { setPlaybackRate(1.75); closeMenu(); }} title="1.75x" />
                    </Menu>
                    <Text style={{ marginLeft: 10, fontSize: 18 }}>{playbackRate}x</Text>
                    </View>
                        <IconButton
                            onPress={handleDownload} disabled={downloading || !!downloadedVideos[selectedVideo?.id]}
                            icon={downloading || !!downloadedVideos[selectedVideo?.id] ? 'cloud-download-outline' : 'cloud-download'}
                            size={24}
                            iconColor={downloading || !!downloadedVideos[selectedVideo?.id] ? 'gray' : 'black'}
                        />
                        {downloading && (
                            <View style={styles.progressContainer}>
                                <Text style={styles.progressText}>
                                    {Math.round(downloadProgress * 100)}%
                                </Text>
                                <TouchableOpacity onPress={handleCancelDownload} style={styles.cancelButton}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <Text style={styles.title}>{selectedVideo?.title}</Text>
            </View>
            <FlatList
                data={videoList}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.videoList}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    loadingIndicator: {
        position: 'absolute',
    },
    detailsContainer: {
        padding: 16,
        width: '100%',
        alignSelf: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color:'black'
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent:'space-between'
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressText: {
        marginLeft: 8,
    },
    cancelButton: {
        marginLeft: 8,
    },
    cancelButtonText: {
        color: 'red',
    },
    playPauseButton: {
        marginLeft: 8,
    },
    videoList: {
        paddingHorizontal: 16,
    },
    videoItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    videoItemTitle: {
        color:'black'
    },
});
