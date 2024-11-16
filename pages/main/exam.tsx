import React, { useState, useEffect, useCallback } from 'react';
import { View, Text,Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { ActivityIndicator, Button, Chip, Icon, RadioButton, } from 'react-native-paper';
import { BASE_URL, MAIN_URL, Question } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const { width: screenWidth } = Dimensions.get('window');
const NUM_ITEMS_PER_ROW = 10;
const itemWidth = (screenWidth - (NUM_ITEMS_PER_ROW + 1) * 8) / NUM_ITEMS_PER_ROW;

export default function ExamScreen() {
  const navigation = useNavigation<any>();
  const searchdata:any = useRoute().params;
  const timeString = Array.isArray(searchdata.time) ? searchdata.time[0] : searchdata.time;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string | null }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStatus, setQuestionStatus] = useState<any[]>([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingexam, setLoadingExam] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [examResponse, setExamResponse] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  useEffect(() => {
    const fetchAuthToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      setAuthToken(token); // Save it to state
    };
    fetchAuthToken();
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${BASE_URL}getQuestions&qsbankid=${searchdata.qbid}&questions=${searchdata.questions}`);
        const data = await response.json();
        if (data) {
          setTimer(parseInt(timeString) * 60);
          setQuestions(data);
          setQuestionStatus(Array(data.length).fill('skipped') as []);
        } else {
          setError('Invalid data format.');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load questions.');
        setLoading(false);
      }
    };
    fetchQuestions();
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1 || prev === 0) {
          return prev - 1;
        } else {
          clearInterval(interval);
          setIsTimeUp(true);
          setModalVisible(true);
          setLoadingExam(false);
          return 0;
        }
      });
    }, 1000);
  
    return () => clearInterval(interval);
  }, [searchdata.id, searchdata.time]);

  let currentQuestion = questions[currentQuestionIndex] || {};
  const options = [
    { key: 'optionA', value: currentQuestion.optionA },
    { key: 'optionB', value: currentQuestion.optionB },
    { key: 'optionC', value: currentQuestion.optionC },
    { key: 'optionD', value: currentQuestion.optionD },
  ];
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setLoadingExam(false);
  }, []);
  const confirmSubmit = async () => {
      const submissionData = questions.map((question) => {
        return {
          id: question.id,
          option: selectedOptions[question.id] || '',
        };
      });
      if(submissionData.length > 0){
        const response = await fetch(`${BASE_URL}submitExam`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: submissionData,
            token: authToken,
            examid: searchdata.examid,
            solved: Object.values(selectedOptions).filter(option => option !== null).length,
            totalQuestion: searchdata.questions,
            correct: searchdata.correct,
          }),
        });
    
        const result = await response.json();
        if (response.ok) {
          if (result.status === 'success') {
            setIsModalVisible(true);
            setExamResponse(result);
            setModalVisible(false);
            setLoading(false);
          } else {
            Toast.show({type: 'error', position: 'top', text1: 'Submit Failed', text2: 'Submission failed' + result.message});
          }
        } else {
          Toast.show({type: 'error',position: 'top', text1: 'Submit Failed', text2: 'Network error' + result.message});
        }
      }else{
        Toast.show({type: 'error', position: 'top', text1: 'Submit Failed', text2: 'Getting Blank Question Set'});
      }
      
  };
  const handleOptionSelect = (questionId: string, optionKey: string) => {
    setSelectedOptions((prevSelectedOptions) => {
      const currentOption = prevSelectedOptions[questionId];
      return {
        ...prevSelectedOptions,
        [questionId]: currentOption === optionKey ? null : optionKey,
      };
    });
  };

  const handleErase = () => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [questions[currentQuestionIndex].id]: null,
    }));
    setQuestionStatus((prevStatus) =>
      prevStatus.map((status, idx) => idx == currentQuestionIndex ? 'skipped' : status)
    );
  };

  const handleNext = () => {
    const currentQuestionId = questions[currentQuestionIndex].id;
    const isAnswered = selectedOptions[currentQuestionId] != null;
    setQuestionStatus((prevStatus) =>
      prevStatus.map((status, idx) =>
        idx == currentQuestionIndex ? (isAnswered ? 'answered' : 'skipped') : status
      )
    );
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleTag = () => {
    setQuestionStatus((prevStatus) =>
      prevStatus.map((status, idx) =>
        idx == currentQuestionIndex ? 'tagged' : status
      )
    );
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    setModalVisible(true);
    setLoadingExam(false);
  };

  const navigateToQuestion = (index: number) => {
    const currentQuestionId = questions[currentQuestionIndex].id;
    const isAnswered = selectedOptions[currentQuestionId] != null;
    setQuestionStatus((prevStatus) =>
      prevStatus.map((status, idx) =>
        idx === currentQuestionIndex ? (isAnswered ? 'answered' : 'skipped') : status
      )
    );
    setCurrentQuestionIndex(index);
  };
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  const checkResult = (examResponse:any) =>{
    setIsModalVisible(false);
    let answered = Object.values(questionStatus).filter(status => status == 'answered').length;
    let solvedQuestions = Object.values(selectedOptions).filter(option => option !== null).length
    navigation.navigate('Result', {
        name:searchdata.name,
        questions:searchdata.questions,
        correct:searchdata.correct,
        time:timeString,
        myexamid:examResponse.myexamid,
        answered:answered,
        unsolved:Number(searchdata.questions) - solvedQuestions,
        correctans:examResponse.correctans,
        incorrect:solvedQuestions - examResponse.correctans,
        formula:examResponse.formula,
        marksobtained:examResponse.marksobtained,
        percentage:examResponse.percentage
    });
  }
  if (loading) {
    return <View style={[styles.container,{justifyContent:'center'}]}>
      <ActivityIndicator size={100} animating={true} />
    </View>;
  }
  if (error) {
    return <View style={[styles.container,{justifyContent:'center',alignContent:'center',alignItems:'center'}]}><Text>{error}</Text></View>;
  }
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.examName} numberOfLines={1} ellipsizeMode="tail">{searchdata.name}</Text>
        <View style={styles.timerContainer}>
          <Icon source="timer" size={24} color="red" />
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.middleSection}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>Q {currentQuestionIndex + 1}.</Text>
          <Text style={styles.questionText}>{currentQuestion?.question || 'No question available'}</Text>
        </View>
        {
          currentQuestion?.image && (
            <Image  source={{ uri: MAIN_URL+currentQuestion?.image }}  style={styles.modalImage} />
          )
        }
        {currentQuestion?.questionType === 'pairs' ? (
          <View>
            {(() => {
              try {
                const pairs = JSON.parse(currentQuestion.pairs);
                const generateLabel = (index: number) => {
                  const letters = 'abcdefghijklmnopqrstuvwxyz';
                  return letters[index] || '';
                };
                return pairs.map((pair: any, index: number) => (
                  <View key={index} style={styles.pairRow}>
                    {Object.keys(pair).map((key) => (
                      <View key={key} style={styles.pairItem}>
                        <Text style={styles.pairKey}>{index + 1}. {key}</Text>
                        <Text style={styles.pairValue}>{generateLabel(index)}. {pair[key]}</Text>
                      </View>
                    ))}
                  </View>
                ));
              } catch (e) {
                return <Text style={styles.errorText}>Error loading pairs</Text>;
              }
            })()}
          </View>
        ) : (
          <View></View>
        )}
          {options.map((option, index) => (
            <TouchableOpacity key={index}
              style={[ styles.option, selectedOptions[currentQuestion.id] == option.key ? styles.active : null ]}
              onPress={() => handleOptionSelect(currentQuestion.id, option.key)}
            >
              <View style={styles.radioContainer}>
                <RadioButton value={option.key} color="#000"
                  status={selectedOptions[currentQuestion.id] == option.key ? 'checked' : 'unchecked'}
                  onPress={() => handleOptionSelect(currentQuestion.id, option.key)}
                />
              </View>
              <Text style={styles.optionText}>{option.value}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
      <View style={styles.bottomSection}>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', margin: 4 }}>
          <Chip style={styles.prevChip} icon={({ size }) => ( <Icon source="step-backward" size={size} /> )}  onPress={handlePrevious}> Previous</Chip>
          <Chip style={styles.nextChip} icon={({ size }) => ( <Icon source="step-forward" size={size} /> )}  onPress={handleNext}>Next</Chip>
        </View>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', margin: 4 }}>
          <Chip style={styles.tagChip}  icon={({ size }) => ( <Icon source="tag" size={size} /> )}  onPress={handleTag}>Tag</Chip>
          <Chip style={styles.eraseChip} icon={({ size }) => ( <Icon source="delete" size={size} /> )}  onPress={handleErase}>Erase</Chip>
        </View>
        <View style={styles.navigatorContainer}>
          <ScrollView contentContainerStyle={styles.navigator}>
            {questions.map((_, index) => {
              const isActive = index == currentQuestionIndex;
              const status = questionStatus[index];
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.navigatorItem,
                    isActive && styles.active,
                    status == 'answered' && !isActive ? styles.answered : null,
                    status == 'skipped' && !isActive ? styles.skipped : null,
                    status == 'tagged' && !isActive ? styles.tagged : null,
                  ]}
                  onPress={() => navigateToQuestion(index)}>
                  <Text style={[styles.navigatorText, { minWidth: 30, textAlign: 'center' }]} numberOfLines={1}>
                    {index + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.buttonContainer}>
          <Button icon={'check-all'} mode="contained" onPress={handleSubmit}>Submit Exam</Button>
        </View>
      </View>
      <Modal transparent={true} visible={modalVisible} onRequestClose={closeModal} animationType='fade'>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Please confirm you have solved all questions. If you really want to submit, then click on confirm submit. Otherwise, click the cancel button.
              </Text>
              <View style={styles.modalInfoContainer}>
                <View style={styles.modalInfoRow}>
                  <View style={{width:'48%',flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={styles.modalInfoText}>Total Qs</Text>
                    <Text style={[styles.modalInfoText,{minWidth:'10%'}]}>: {searchdata.questions}</Text>
                  </View>
                  <View style={{width:'48%',flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={styles.modalInfoText}>Tagged Qs</Text>
                    <Text style={[styles.modalInfoText,{minWidth:'10%'}]}>: {Object.values(questionStatus).filter(status => status == 'tagged').length}</Text>
                  </View>
                  
                </View>
                <View style={styles.modalInfoRow}>
                  <View style={{width:'48%',flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={styles.modalInfoText}>Solved Qs</Text>
                    <Text style={[styles.modalInfoText,{minWidth:'10%'}]}>: {Object.values(selectedOptions).filter(option => option !== null).length}</Text>
                  </View>
                  <View style={{width:'48%',flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={styles.modalInfoText}>Unsolved Qs</Text>
                    <Text style={[styles.modalInfoText,{minWidth:'10%'}]}>: {Number(searchdata.questions) - (Object.values(selectedOptions).filter(option => option !== null).length)}</Text>
                  </View>
                  
                </View>
              </View>
              <View style={styles.modalButtonsContainer}>
                {!loadingexam ? (
                  <>
                  {!isTimeUp && (
                    <Button  icon="close"  mode="contained"  onPress={closeModal}  style={styles.cancelButton} labelStyle={styles.buttonLabel}>Cancel</Button>
                  )}
                  
                  </>
                ) : (<></>)}
                <Button icon="check-all"  mode="contained" loading={loadingexam ? true:false} onPress={confirmSubmit} style={styles.submitButton} disabled={loadingexam} labelStyle={styles.buttonLabel}>
                  {loadingexam ? 'Submtting...' : 'Confirm Submit'}
                </Button>
              </View>
            </View>
          </View>
      </Modal>
      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSub}>
            <View style={styles.backendImage} />
            <Image source={require('../../assets/success.png')} resizeMode="contain" style={StyleSheet.flatten([styles.image, styles.successImage])} />
            <View style={styles.cardBody}>
              <Text style={styles.titleLabel}>Submitted !</Text>
              <Text style={styles.description}>Exam Submitted Successfully</Text>
            </View>
            <View style={styles.cardFooter}>
              <Button mode="contained" onPress={() => checkResult(examResponse)}>Check Result</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalImage: { width: '100%',},
  container: {
    flex: 1,
    flexDirection: 'column',
    padding:5
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical:10
  },
  middleSection: {
    flexGrow: 1,
  },
  bottomSection: {
    minHeight: 240,
  },
pairRow: {
  flexDirection: 'row',
  marginVertical: 8,
},
pairItem: {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
},
pairKey: {
  flex: 1,
  textAlign: 'left',
},
pairValue: {
  flex: 1,
  textAlign: 'left',
},
errorText: {
  color: 'red',
  textAlign: 'center',
  marginTop: 10,
},
image: {
  alignSelf: 'center',
  width: 80,
  aspectRatio: 1,
  position: 'absolute',
  top: -45,
},
successImage:{
  tintColor: 'green',
},
cardContainer: {
  alignSelf: 'center',
  maxWidth: 400,
  width: '80%',
  minHeight: 250,
  borderRadius: 24,
  paddingHorizontal: 12,
  paddingTop: 50,
  paddingBottom: 24,
  position: 'absolute',
},
  backendImage: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    height: 50,
    width: 50,
    backgroundColor: '#FBFBFB',
    borderRadius: 100,
    marginTop: -30,
  },
  titleLabel: {
    fontWeight: 'bold',
    fontSize: 20,
    color:'black',
    justifyContent:'center',
    textAlign:'center'
  },
  description:{
    textAlign:'center',
    marginTop:10,
    color:'black'
  },
  cardBody: {
    marginTop:50,
    textAlign:'center',
    justifyContent:'center',
    
  },
  cardFooter: {
    marginTop:30
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
modalContentSub: {
  width: 300,
  padding: 20,
  backgroundColor: 'white',
  borderRadius: 10,
},
examName: {
  fontSize: 18,
  fontWeight: 'bold',
  color:'#316FF6',
  flex:1
},
timerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  fontSize: 16,
  color: 'red',
},
timerText: {
  fontSize: 16,
  color: 'red',
  marginLeft: 8,
  fontWeight: 'bold',
},
question: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 16,
},
prevChip: {
  backgroundColor: '#57b1e8',
  borderColor: '#3788b9',
  borderWidth: 1,
  width: '40%'
},
nextChip: {
  backgroundColor: '#55de4a',
  borderColor: '#23c61b',
  borderWidth: 1,
  width: '40%'
},
tagChip: {
  backgroundColor: '#FFC300',
  borderColor: 'orange',
  borderWidth: 1,
  width: '40%'
},
eraseChip:{
  backgroundColor: '#f9afa6',
  borderColor: '#d25e50',
  borderWidth: 1,
  width: '40%'
},
chipText: {
  color: 'white',
},
navigatorContainer: {
  flex: 1,
  minHeight:100,
  maxHeight:100
},
navigator: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  backgroundColor: '#88dfdf4a',
  padding: 4,
},
navigatorItem: {
  width: itemWidth,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 4,
  margin: 2,
  borderRadius: 5,
  backgroundColor: '#ddd',
},
active: {
  backgroundColor: '#55de4a',
},
answered: {
  backgroundColor: '#2196F3',
},
skipped: {
  backgroundColor: '#ddd',
},
tagged: {
  backgroundColor: '#FFC300',
},
navigatorText: {
  fontSize: 16,
  color: '#000',
  textAlign: 'center',
  flexWrap:'nowrap'
},
submitButton: {
  flex: 1,
  marginLeft: 10,
  backgroundColor: '#4caf50',
},
option: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 4,
  borderRadius: 5,
  borderColor: '#ddd',
  borderWidth: 1,
},
optionText: {
  fontSize: 16,
  marginLeft: 10,
  color:'black'
},
radioContainer: {
  marginRight: 10,
},
buttonContainer: {
  paddingTop: 5,
  borderTopWidth: 1,
  borderTopColor: '#ddd',
  backgroundColor: '#fff',
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
questionContainer: {
  flexDirection: 'row',
  marginBottom:10
},
questionNumber: {
  fontSize: 16,
  marginRight: 8,
  fontWeight:'bold',
  color:'black'
},
questionText: {
  fontSize: 16,
  flex: 1,
  fontWeight:'bold',
  color:'black',
},
modalContainer: {
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
  width: Dimensions.get('window').width,
  padding: 20,
  backgroundColor: '#fff',
  borderRadius: 8,
  elevation: 4,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 20,
  color: '#333',
},
modalButtonsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
},
cancelButton: {
  flex: 1,
  marginRight: 10,
  backgroundColor: '#f44336',
},
buttonLabel: {
  fontSize: 16,
  color: 'white',
},
modalInfoContainer: {
  width: '100%',
  marginBottom: 20,
},
modalInfoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 8,
},
modalInfoText: {
  fontSize: 16,
  color: 'black',
  justifyContent:'space-between',
  fontWeight:'bold',
  textAlign: 'left',
}
});