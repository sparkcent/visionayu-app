import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Linking, Image } from 'react-native';
import { TabsProvider, Tabs, TabScreen } from 'react-native-paper-tabs';
import Collapsible from 'react-native-collapsible';
import ImageModal from 'react-native-image-modal';
import { BASE_URL, MAIN_URL } from '../types';
import { ActivityIndicator, Icon } from 'react-native-paper';
import Video from 'react-native-video';

interface Section {
  title: string;
  description: string;
  source: string;
  id: string;
  format:string;
}

const TextTab: React.FC<{ sections: Section[] }> = ({ sections }) => {
  const [collapsed, setCollapsed] = useState<boolean[]>(sections.map(() => true));

  const toggleExpanded = (index: number) => {
    setCollapsed(prevState => prevState.map((item, i) => (i === index ? !item : item)));
  };

  return (
    <View style={styles.tabContainer}>
      {sections.map((section, index) => (
        <View key={index} style={styles.tabmainContainer}>
          <TouchableOpacity onPress={() => toggleExpanded(index)} style={styles.header}>
            <Text style={styles.headerText}>{section.title}</Text>
            <Icon source={collapsed[index] ? 'chevron-down' : 'chevron-up'} size={24} color="black" />
          </TouchableOpacity>
          <Collapsible collapsed={collapsed[index]} align="center">
            <View style={styles.content}>
              <Text style={{color:'black'}}>{section.description}</Text>
            </View>
          </Collapsible>
        </View>
      ))}
    </View>
  );
};

const ImagesTab: React.FC<{ sections: Section[] }> = ({ sections }) => {
  const renderItem = ({ item }: { item: Section }) => (
    <View style={{margin:5}}>
      <ImageModal
        source={{ uri: MAIN_URL+item.source }}
        style={styles.image}
      />
    </View>
  );

  return (
    <View style={styles.tabContainer}>
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2} // Set number of columns to 2
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const VideoTab: React.FC<{ sections: any[] }> = ({ sections }) => {
    const [currentVideo, setCurrentVideo] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoPlayer = useRef(null);
  
    useEffect(() => {
      if (sections.length > 0) {
        const initialSource = sections[0].source ? MAIN_URL + sections[0].source : sections[0].youtube;
        setCurrentVideo(initialSource);
      }
    }, [sections]);
  
    const handlePlay = (source: string | null, youtube: string | null) => {
      if (source) {
          setCurrentVideo(MAIN_URL + source);
          setIsPlaying(true);
      } else if (youtube) {
          Linking.openURL(youtube).catch(err => console.error("Failed to open URL: ", err));
      }
    };
    return (
      <View style={styles.tabContainer}>
        {currentVideo && (
          <View style={styles.videoPlayerContainer}>
            <Video
              ref={videoPlayer}
              source={{ uri: currentVideo }}
              style={styles.video}
              paused={!isPlaying}
              controls={true}
              onEnd={() => setIsPlaying(false)}
              resizeMode="contain"
            />
          </View>
        )}
        <FlatList
          data={sections}
          style={styles.fullwidth}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.videoItem} onPress={() => handlePlay(item.source, item.youtube)}>
              <View style={styles.thumbnailContainer}>
                {item.thumbnail && (
                  <Image 
                    source={{ uri: item.thumbnail }} 
                    style={styles.thumbnail} 
                    resizeMode="contain" 
                  />
                )}
                <Text style={styles.title}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    );
};

export default function ReadingScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Section[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}readingTips`);
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
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

  const textSections = data.filter(item => item.format == 'Text');
  const imageSections = data.filter(item => item.format == 'Image');
  const videoSections = data.filter(item => item.format == 'Video');

  return (
    <TabsProvider defaultIndex={0}>
      <Tabs>
        <TabScreen label="Text">
          <TextTab sections={textSections} />
        </TabScreen>
        <TabScreen label="Images">
          <ImagesTab sections={imageSections} />
        </TabScreen>
        <TabScreen label="Video">
          <VideoTab sections={videoSections} />
        </TabScreen>
      </Tabs>
    </TabsProvider>
  );
}
const screenWidth = Dimensions.get('window').width;
const imageWidth = (screenWidth / 2) - 20;
const styles = StyleSheet.create({
  thumbnailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  thumbnail: {
    width: 80,
    height: 'auto',
    aspectRatio: 16 / 9,
    marginRight: 10, // Space between thumbnail and title
    borderRadius: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    width: '100%',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'black'
  },
  content: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  grid: {
    justifyContent: 'space-around',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  imageWrapper: {
    margin: 5,
  },
  image: {
    width: imageWidth,
    height: imageWidth,
  },
  fullwidth: {
    width: '100%',
  },
  videoPlayerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
    marginBottom: 10,
  },
  videoItem: {
    flexDirection: 'row',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
    flex: 1,
    color:'black'
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  listContainer: {
    justifyContent: 'space-around',
  },
  tabContainer: {
    flex: 1,
    padding: 10
  },
  tabmainContainer:{
    backgroundColor: 'white',
    elevation: 3,
    marginBottom:10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  }
});