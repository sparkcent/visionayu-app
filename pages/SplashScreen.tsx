import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video'; // Import react-native-video
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = () => {
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userToken = await AsyncStorage.getItem('authToken');
      if (userToken) {
        navigation.replace('HomeScreen');
      } else {
        navigation.replace('Login');
      }
    };

    if (isVideoFinished) {
      checkLoginStatus();
    }
  }, [isVideoFinished, navigation]);

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/intro.mp4')}
        style={styles.video}
        resizeMode="contain"
        onEnd={() => setIsVideoFinished(true)}
        onError={(error) => console.log('Error playing video:', error)}
        repeat={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;
