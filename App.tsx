import React from 'react';
import { ScrollView, StyleSheet, View, Dimensions, StatusBar, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DataProvider } from './pages/DataContext';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './pages/login';
import RegistrationScreen from './pages/registration';
import ForgotPassword from './pages/forgot';
import HomeScreen from './pages/main/home';
import FreeTestScreen from './pages/main/freetest';
import TestReviewScreen from './pages/main/reviewtest';
import ExamScreen from './pages/main/exam';
import TestResultScreen from './pages/main/result';
import MnemonicsScreen from './pages/main/mnemonics';
import ReadingScreen from './pages/main/reading';
import StudyScreen from './pages/main/study';
import PaidTestListScreen from './pages/main/paidtestlist';
import AmbiguityScreen from './pages/main/ambiguity';
import HowToUseScreen from './pages/main/howtouse';
import AboutScreen from './pages/main/about';
import DownloadedVideos from './pages/main/downloaded';
import VideosScreen from './pages/main/videos';
import VideoDetailsScreen from './pages/main/videoDetails';
import PaidTestScreen from './pages/main/paidtest';
import OtherExamsScreen from './pages/main/otherExams';
import ProfileScreen from './pages/main/profile';
import Video from 'react-native-video';
import RankingScreen from './pages/main/ranking';
import Toast from 'react-native-toast-message';

const IntroVideo: React.FC<{ onVideoEnd: () => void }> = ({ onVideoEnd }) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  return (
    <View style={[styles.videoContainer, { width: screenWidth, height: screenHeight }]}>
      <Video
        source={require('./assets/intro.mp4')}
        style={styles.video}
        controls={false}
        resizeMode="contain"
        onEnd={onVideoEnd}
      />
    </View>
  );
};

const IntroVideoScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleVideoEnd = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      navigation.navigate('HomeScreen');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
      <IntroVideo onVideoEnd={handleVideoEnd} />
    </ScrollView>
  );
};

const Stack = createNativeStackNavigator<any>();

function App(): React.JSX.Element {
  return (
    <PaperProvider>
      <NavigationContainer>
        <SafeAreaView style={styles.container}>
          <StatusBar backgroundColor={'#316FF6'}/>
          <DataProvider>
              <Stack.Navigator initialRouteName="IntroVideo" screenOptions={{
                headerStyle: { backgroundColor: '#316FF6' },
                headerTintColor: '#fff',
                }}>
                <Stack.Screen name="IntroVideo" component={IntroVideoScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
                <Stack.Screen 
                  name="HomeScreen" 
                  component={HomeScreen} 
                  options={({ navigation }) => ({ 
                    title: 'Vision Ayurved', 
                    headerShown: true, 
                    headerBackVisible: false,
                    headerRight: () => (
                      <TouchableOpacity onPress={() => {
                        AsyncStorage.clear();
                        navigation.replace('Login');
                      }} style={{ marginRight: 5 }}>
                          <Text style={{ color: 'white', fontSize: 14 }}>Logout</Text>
                      </TouchableOpacity>
                    ),
                  })} 
                />
                <Stack.Screen name="FreeTest" component={FreeTestScreen} options={{ title: 'Free Test', headerShown: true }} />
                <Stack.Screen name="Review" component={TestReviewScreen} options={{ title: 'Review Test', headerShown: true }} />
                <Stack.Screen name="Ranking" component={RankingScreen} options={{ title: 'Ranking', headerShown: true }} />
                <Stack.Screen name="Exam" component={ExamScreen} options={{ title: 'Exam', headerShown: true }} />
                <Stack.Screen name="Result" component={TestResultScreen} options={{ title: 'Test', headerShown: true }} />
                <Stack.Screen name="mnemonics" component={MnemonicsScreen} options={{ title: 'Mnemonics', headerShown: true }} />
                <Stack.Screen name="study" component={StudyScreen} options={{ title: 'Study Tips', headerShown: true }} />
                <Stack.Screen name="reading" component={ReadingScreen} options={{ title: 'Reading', headerShown: true }} />
                <Stack.Screen name="paidtest" component={PaidTestScreen} options={{ title: 'Paid Tests', headerShown: true }} />
                <Stack.Screen name="paidTestList" component={PaidTestListScreen} options={{ title: 'Paid Tests', headerShown: true }} />
                <Stack.Screen name="videos" component={VideosScreen} options={{ title: 'Video Lectures', headerShown: true }} />
                <Stack.Screen name="videoDetails" component={VideoDetailsScreen} options={{ title: 'Video Details', headerShown: true }} />
                <Stack.Screen name="ambiguity" component={AmbiguityScreen} options={{ title: 'Ambiguity', headerShown: true }} />
                <Stack.Screen name="howtouse" component={HowToUseScreen} options={{ title: 'How To use', headerShown: true }} />
                <Stack.Screen name="about" component={AboutScreen} options={{ title: 'About Us', headerShown: true }} />
                <Stack.Screen name="downloads" component={DownloadedVideos} options={{ title: 'Downloads', headerShown: true }} />
                <Stack.Screen name="otherexams" component={OtherExamsScreen} options={{ title: 'Other Exams', headerShown: true }} />
                <Stack.Screen name="profile" component={ProfileScreen} options={{ title: 'Profile', headerShown: true }} />
              </Stack.Navigator>
          </DataProvider>
        </SafeAreaView>
      </NavigationContainer>
      <Toast />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: '#f8f8f8',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor:'#000'
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default App;
