// IntroVideo.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Video from 'react-native-video';

interface IntroVideoProps {
  onVideoEnd: () => void;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onVideoEnd }) => {
  return (
    <View style={styles.videoContainer}>
      <Video
        source={require('../assets/intro.mp4')} // Update the path as necessary
        style={styles.video}
        controls={true}
        resizeMode="cover"
        onEnd={onVideoEnd} // Trigger the function passed as a prop when the video ends
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  video: {
    width: Dimensions.get('window').width - 40, // Responsive video width
    height: 200, // Video height
  },
});

export default IntroVideo;
