import { Button, FAB, IconButton, Portal, RadioButton, Text } from "react-native-paper";
import { FlatList, Modal, StyleSheet, TouchableOpacity, View, Image, Dimensions, Linking } from 'react-native';
import { BASE_URL, Item, MAIN_URL } from "../types";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from "react-native-video";
import { useData } from "../DataContext";
import { Route } from '../types';

const numColumns = 3;
const windowWidth = Dimensions.get('window').width;
const itemWidth = windowWidth / numColumns;
const items: Item[] = [
  { id: 1, title: 'Free Tests', nav: 'FreeTest', image: require('../../assets/freetest.png'), bgColor: '#5C6BC0' },
  { id: 2, title: 'Paid Tests', nav: 'paidtest', image: require('../../assets/paidtest.png'), bgColor: '#FA8072' },
  { id: 3, title: 'Videos Lectures', nav: 'videos', image: require('../../assets/video.png'), bgColor: '#81D4FA' },
  { id: 4, title: 'Other Exams', nav: 'otherexams', image: require('../../assets/otherexams.png'), bgColor: '#5C6BC0' },
  { id: 5, title: 'Reading Stuff', nav: 'reading', image: require('../../assets/reading.png'), bgColor: '#98FB98' },
  { id: 6, title: 'Study Tips', nav: 'study', image: require('../../assets/study.png'), bgColor: '#20B2AA' },
  { id: 7, title: 'Mnemonics', nav: 'mnemonics', image: require('../../assets/mnemonics.png'), bgColor: '#5C6BC0' },
  { id: 8, title: 'My Profile', nav: 'profile', image: require('../../assets/profile.png'), bgColor: '#20B2AA' },
  { id: 9, title: 'Ambiguity', nav: 'ambiguity', image: require('../../assets/ambiguity.png'), bgColor: '#B0E0E6' },
  { id: 10, title: 'About Us', nav: 'about', image: require('../../assets/logo.png'), bgColor: '#E6E6FA' },
  { id: 11, title: 'How To Use ?', nav: 'howtouse', image: require('../../assets/use.png'), bgColor: '#F5F5DC' },
  { id: 12, title: 'Downloads', nav: 'downloads', image: require('../../assets/download.png'), bgColor: '#fe9206' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMtvVisible, setModalMtvVisible] = useState(false);
  const [prevCountdown, setCountdown] = useState(30);
  const [prevMtvCountdown, setMtvCountdown] = useState(30);
  const [question, setQuestion] = useState<string>('');
  const [motivational, setMotivational] = useState<any>('');
  const [options, setOptions] = useState<{ key: string, value: string }[]>([]);
  const [qodImage, setqodImage] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [option, setOption] = useState({ value: '', error: '' });
  const [resultMessage, setResultMessage] = useState('');
  const [resultColor, setResultColor] = useState('');
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    const checkModalStatus = async () => {
      const lastShownDate = await AsyncStorage.getItem('modalShownDate');
      const today = new Date().toISOString().split('T')[0];
      if (lastShownDate !== today) {
        fetchQOD();
      }
    };

    checkModalStatus();
  }, []);

  const hideModal = () => {
    setModalVisible(false);
    setModalMtvVisible(true);
    setMtvCountdown(30);
    setTimeout(hideMtvModal, 30000);
    startMtvCountdown();
    const today = new Date().toISOString().split('T')[0];
    AsyncStorage.setItem('modalShownDate', today);
  }
  const hideMtvModal = () => {
    setModalMtvVisible(false);
  }
  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };
  const startMtvCountdown = () => {
    const interval = setInterval(() => {
      setMtvCountdown(prevMtvCountdown => {
        if (prevMtvCountdown <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevMtvCountdown - 1;
      });
    }, 1000);
  };
  const fetchQOD = async () => {
    try {
      const response = await fetch(`${BASE_URL}getqod`);
      const data = await response.json();
      let questiondata = data.question;
      if(questiondata){
        if(questiondata.question == ''){
          questiondata.question = 'Question of The Day';
        }
        setQuestion(questiondata.question);
        setOptions([
          { key: 'optionA', value: questiondata.optionA },
          { key: 'optionB', value: questiondata.optionB },
          { key: 'optionC', value: questiondata.optionC },
          { key: 'optionD', value: questiondata.optionD },
        ]);
        setqodImage(`${MAIN_URL}`+questiondata.image);
        setCorrectAnswer(questiondata.answer);
        setCountdown(30);
        setResultMessage('');
        setResultColor('');
        setModalVisible(true);
        startCountdown();
        setTimeout(hideModal, 30000);
      }
      let motivational = data.motivational;
      if(motivational){
        if(!questiondata){
          hideModal();
        }
        setMotivational(motivational);
      }
    } catch (error) {
      console.error('Error fetching QOD:', error);
    }
  };
  const selectedOptionValidator = (value: string) => {
    if (!value) return 'Select your option';
    return '';
  };
  const submitReport = async () => {
    const optionError = selectedOptionValidator(option.value);
    if (optionError) {
      setOption({ ...option, error: optionError });
      return;
    }
    const isCorrect = option.value === correctAnswer;
    setResultMessage(isCorrect ? 'Correct!' : 'Incorrect');
    setResultColor(isCorrect ? 'green' : 'red');
    setSubmitted(true);
  };
  const [state, setState] = useState({ open: false });
  const onStateChange = ({ open }:{open:any}) => setState({ open });
  const { open } = state;
  const [whatsApplink, setWhatsAppUrl] = useState<string>('');
  const { whatsAppUrl } = useData();
  
  useEffect(() => {
    if (whatsAppUrl) {
      setWhatsAppUrl(whatsAppUrl);
    }
  }, [whatsAppUrl]);
  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity style={styles.gridItemContainer} onPress={() => navigation.navigate(`${item.nav}`)}>
      <View style={[styles.gridItem]}>
        <View style={[styles.imageViewItem, { backgroundColor: item.bgColor }]}>
          <Image source={item.image} style={styles.gridImage} />
        </View>
      </View>
      <View style={styles.textHeight}>
        <Text style={styles.gridTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={{flex:1}}>
      <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} numColumns={3} />

      <FAB.Group
        open={open}
        visible
        style={{position:'absolute',bottom:0,right:0}}
        variant="surface"
        color="black"
        icon={open ? 'close-octagon-outline' : 'whatsapp'}
        actions={[
          {
            icon: 'whatsapp',
            label: 'Join Group',
            onPress: () => Linking.openURL(whatsApplink),
          },
          {
            icon: 'email',
            label: 'Contact us',
            onPress: () => Linking.openURL('mailto:info@visionayunagpur.com'),
          },
        ]}
        onStateChange={onStateChange}
        onPress={() => {
          if (open) {
            // do something if the speed dial is open
          }
        }}
      />
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={hideModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <IconButton icon="close" size={24} onPress={hideModal} style={styles.closeButton} />
            <View style={styles.questionTimerContainer}>
              <Text style={styles.questionText}>{question}</Text>
              <Text style={styles.timerText}>{prevCountdown}</Text>
            </View>
            <Image source={{ uri: qodImage }} style={styles.modalImage} />
            <RadioButton.Group onValueChange={newValue => setOption({ value: newValue, error: '' })} value={option.value}>
              <View style={styles.radioGroupRow}>
                {options.map((optionItem, index) => (
                  
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.radioRow,
                      {
                        borderColor: 
                          resultMessage !== '' && option.value === optionItem.key
                            ? optionItem.key === correctAnswer ? 'green' : 'red'
                            : optionItem.key === correctAnswer && resultMessage !== '' ? 'green' : '#ddd',
                      },
                      { borderWidth: 2 },
                    ]}
                    onPress={() => setOption({ value: optionItem.key, error: '' })} activeOpacity={0.7}
                  >
                    <RadioButton
                      value={optionItem.key}
                      color={
                        resultMessage !== '' && optionItem.key === correctAnswer ? 'green'
                          : resultMessage !== '' && option.value === optionItem.key && optionItem.key !== correctAnswer
                          ? 'red' : undefined
                      }
                    />
                    <Text>{optionItem.value}</Text>
              
                  </TouchableOpacity>
                ))}
              </View>
            </RadioButton.Group>
            <Button style={{ marginVertical: 10 }} mode="contained" onPress={submitReport} buttonColor={resultColor || ''}>{resultMessage !== '' ? resultMessage : 'Submit'}</Button>
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" transparent={true} visible={modalMtvVisible} onRequestClose={hideMtvModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <IconButton icon="close" size={24} onPress={hideMtvModal} style={styles.closeButton} />
            <View style={styles.questionTimerContainer}>
              <Text style={styles.questionText}>{motivational?.text}</Text>
              <Text style={styles.timerText}>{prevMtvCountdown}</Text>
            </View>
            {
              motivational?.image && (
                <Image  source={{ uri: MAIN_URL+motivational?.image }}  style={styles.modalImage} />
              )
            }
            {
              motivational.video && (
                <View style={styles.videoContainer}>
                  <Video
                      resizeMode='contain'
                      style={styles.video}
                      source={{ uri: MAIN_URL+motivational.video }}
                      controls={true}
                  />
                </View>
              )
            }
          </View>
        </View>
      </Modal>
    </View>
  );
}
const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  gridItemContainer: { alignItems: 'center', justifyContent: 'center', width: itemWidth, padding: 10, },
  gridItem: { alignItems: 'center', padding: 5, justifyContent: 'center', width: '100%', },
  imageViewItem: { padding: 5, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, },
  gridImage: { width: 40, height: 40, },
  textHeight: { height: 50, },
  gridTitle: { fontSize: 14, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 5, },
  containerStyle: { backgroundColor: 'white', padding: 20 },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 0, margin: 0,backgroundColor: 'rgba(0,0,0,0.5)', },
  modalView: {backgroundColor: 'white', margin: 30,width:screenWidth * 0.85, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, padding: 20,},
  closeButton: {position: 'absolute', right: -18, top: -18, backgroundColor: 'white', borderColor: 'gray', zIndex: 9999,},
  modalImage: { width: '100%', height: undefined, aspectRatio: 1, borderRadius: 10,marginBottom:10 },
  questionTimerContainer: { flexDirection: 'row', justifyContent: 'space-between',alignItems: 'center',marginBottom: 10,},
  timerText: { fontSize: 16,fontWeight: 'bold',marginBottom: 10,color: 'red',},
  radioGroupRow: { alignItems:'flex-start',alignContent:'flex-start' },
  radioRow: { width:'100%',flexDirection: 'row',alignItems: 'center',marginVertical: 4,borderRadius: 5,borderColor: '#ddd',borderWidth: 1,},
  questionText:{fontWeight:'bold'},
  videoContainer: {width: '100%',aspectRatio: 16 / 9,backgroundColor: '#000',justifyContent: 'center', alignItems: 'center', },
  video: { width: '100%', height: '100%', },
})