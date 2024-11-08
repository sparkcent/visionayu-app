import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Alert, Modal, ActivityIndicator, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { BASE_URL, Question } from '../types';
import { Button, IconButton, RadioButton, TextInput } from 'react-native-paper';
import ViewShot from 'react-native-view-shot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import Share from 'react-native-share';

export default function TestReviewScreen() {
    const searchdata:any = useRoute().params;
    const ref = useRef<(any | null)[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [option, setOption] = useState({ value: '', error: '' });
    const [comment, setComment] = useState({ value: '', error: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [subitingReport, setSubmitReport] = useState(false);

    useEffect(() => {
        fetch(`${BASE_URL}getExamQuestions&id=${searchdata?.myexamid}`)
            .then(response => response.json())
            .then(data => {
                setQuestions(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, []);

    const getOptionStyle = (question: Question, option: string) => {
        if (option === question.correct_option) {
            if (question.selected_option === option) {
                return styles.correctOption;
            } else {
                return question.selected_option === '' ? styles.unansweredOption : styles.correctOption;
            }
        }
        if (question.selected_option === option && option !== question.correct_option) {
            return styles.incorrectOption;
        }
        return styles.defaultOption;
    };

    const handleShare = async (index: number) => {
        const uri = await ref.current[index].capture();
        await Share.open({
            title: 'Share file',
            message: 'https://www.youtube.com/@visionayurved4949',
            url: uri,
        });
    };

    const renderQuestion = ({ item, index }: { item: Question; index: number }) => (
        <View style={styles.questionmainContainer}>
            <ViewShot ref={(viewShot) => ref.current[index] = viewShot} options={{ format: 'jpg', quality: 0.9 }}>
                <ImageBackground
                    source={require('../../assets/logo.png')}
                    style={styles.imageBackground}
                    imageStyle={styles.imageWithOpacity}
                >
                    <Text style={styles.titleText}>Vision Ayurved Academy, Nagpur</Text>
                    <Text style={styles.questionText}>Q {`${index + 1}. ${item.question}`}</Text>
                    {item.questionType === 'pairs' ? (
                        <View>
                            {(() => {
                                try {
                                    const pairs = JSON.parse(item.pairs);
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
                                    console.error('Failed to parse pairs:', e);
                                    return <Text style={styles.errorText}>Error loading pairs</Text>;
                                }
                            })()}
                        </View>
                    ) : null}
                    <Text style={[styles.optionText, getOptionStyle(item, 'optionA')]}>{`A. ${item.optionA}`}</Text>
                    <Text style={[styles.optionText, getOptionStyle(item, 'optionB')]}>{`B. ${item.optionB}`}</Text>
                    <Text style={[styles.optionText, getOptionStyle(item, 'optionC')]}>{`C. ${item.optionC}`}</Text>
                    <Text style={[styles.optionText, getOptionStyle(item, 'optionD')]}>{`D. ${item.optionD}`}</Text>
                </ImageBackground>
            </ViewShot>
            <View style={styles.buttonContainer}>
                <Button icon="share" mode="outlined" onPress={() => handleShare(index)}>Share</Button>
                <Button icon="chat-question" mode="outlined" onPress={() => openModal(item)}>Raise Ambiguity</Button>
            </View>
        </View>
    );

    const openModal = useCallback((exam: Question) => {
        setOption({ value: '', error: '' });
        setComment({ value: '', error: '' });
        setSelectedExam(exam);
        setModalVisible(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    const submitReport = async () => {
        if (!selectedExam) return;
        const optionError = selectedOptionValidator(option.value);
        const commentError = commentValidator(comment.value);
        if (optionError || commentError) {
            setOption({ ...option, error: optionError });
            setComment({ ...comment, error: commentError });
            return;
        }
        setSubmitReport(true);
        const token = await AsyncStorage.getItem('authToken');
        const reportData = {
            myexamid: searchdata.myexamid,
            questionId: selectedExam.id,
            correctAnswer: selectedExam.correct_option,
            selectedOption: option.value,
            reference: comment.value,
            token: token
        };
        try {
            const response = await fetch(`${BASE_URL}submitReport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData),
            });
            const result = await response.json();
            if (result.status == 'success') {
                Alert.alert('Report Submitted', 'Your report has been submitted successfully.');
                closeModal();
                setSubmitReport(false);
            } else {
                Alert.alert('Note', result.message);
                closeModal();
                setSubmitReport(false);
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            Alert.alert('Error', 'There was an error submitting your report.');
            setSubmitReport(false);
        }
    };

    const selectedOptionValidator = (value: string) => {
        if (!value) return 'Select your option';
        return '';
    };

    const commentValidator = (comment: string) => {
        if (comment.trim() === '') return 'Description cannot be empty';
        return '';
    };
    const formatOption = (option:any) => {
        if (option && option.length > 6) {
          return option.slice(0, 6) + ' ' + option.slice(6);
        }
        return option;
    };
    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
                <View style={styles.statusBoxCorrect}>
                    <Text style={styles.statusText}>Correct Answers</Text>
                </View>
                <View style={styles.statusBoxWrong}>
                    <Text style={styles.statusText}>Wrong Answers</Text>
                </View>
            </View>
            <View style={styles.statusBoxUnresolved}>
                <Text style={styles.statusText}>Correct Answer of Unsolved Questions</Text>
            </View>
            {loading ? (
                <View style={[styles.container,{justifyContent:'center'}]}>
                    <ActivityIndicator size={100} animating={true} />
                </View>
            ) : (
                <FlatList
                    data={questions}
                    renderItem={renderQuestion}
                    keyExtractor={item => item.id.toString()}
                />
            )}
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
                animationType='fade'>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ambiguity Report Submit</Text>
                            <IconButton icon="close" size={24} onPress={closeModal} style={styles.closeIcon} />
                        </View>
                        <View style={{flexDirection:'row'}}>
                            <Text style={styles.boldText}>Our Answer   : </Text>
                            <Text style={styles.content}>{formatOption(selectedExam?.correct_option)}</Text>
                        </View>
                        <Text>
                            <Text style={styles.boldText}>Your Answer : </Text>
                        </Text>
                        <RadioButton.Group onValueChange={newValue => setOption({ value: newValue, error: '' })} value={option.value}>
                            <View style={styles.radioGroupRow}>
                                {['A', 'B', 'C', 'D'].map((label, index) => (
                                    <View key={index} style={styles.radioRow}>
                                        <RadioButton value={`option${label}`} />
                                        <Text style={styles.content}>Option {label}</Text>
                                    </View>
                                ))}
                            </View>
                        </RadioButton.Group>
                        <TextInput label='Description' value={comment.value} onChangeText={text => setComment({ value: text, error: '' })} mode='outlined' multiline numberOfLines={4} />
                        {comment.error ? <Text style={styles.errorText}>{comment.error}</Text> : null}
                        {option.error ? <Text style={styles.errorText}>{option.error}</Text> : null}
                        <Button style={{marginVertical:20}} loading={subitingReport} disabled={subitingReport} mode="contained" onPress={submitReport}>Submit</Button>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    correctOption: {backgroundColor: '#28a745',color: 'white',alignSelf: 'flex-start',},
    incorrectOption: {backgroundColor: '#dc3545',color: 'white',alignSelf: 'flex-start',},
    unansweredOption: {backgroundColor: '#ffc107',color: 'white',alignSelf: 'flex-start',},
    defaultOption: {backgroundColor: 'transparent',color: '#000',},
    errorText: { color: 'red', textAlign: 'center', marginTop: 10 },
    modalContainer: {flex: 1,justifyContent: 'flex-end',alignItems: 'center',backgroundColor: 'rgba(0, 0, 0, 0.5)',},
    modalContent: {width: Dimensions.get('window').width,padding: 10,backgroundColor: '#fff',borderRadius: 8,marginBottom:-8,elevation: 4,},
    modalTitle: {fontSize: 18,fontWeight: 'bold',marginBottom: 10,color:'black'},
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    radioGroupRow: { flexDirection: 'row', justifyContent: 'space-between' },
    radioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    closeIcon: { alignSelf: 'flex-end' },
    container: { flex: 1, padding: 8, backgroundColor: '#f0f0f0' },
    statusContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
    statusBoxResolved: {backgroundColor: '#007BFF',padding: 8,borderRadius: 5,alignItems: 'center',},
    statusBoxUnresolved: {backgroundColor: '#ffc107',padding: 8,borderRadius: 8,alignItems: 'center',width: '100%',},
    statusText: {color: '#fff',fontSize: 16,fontWeight: 'bold',},
    statusBoxCorrect: { backgroundColor: '#28a745', padding: 8, borderRadius: 8, alignItems: 'center', width: '45%' },
    statusBoxWrong: { backgroundColor: '#dc3545', padding: 8, borderRadius: 8, alignItems: 'center', width: '45%' },
    optionText: {fontSize: 16,marginVertical: 5,padding: 10,borderRadius: 8,overflow: 'hidden',},
    buttonContainer: {display: 'flex',flexDirection: 'row',justifyContent: 'space-between',paddingHorizontal: 10,marginBottom: 10,},
    pairItem: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
    pairRow: { flexDirection: 'row', marginVertical: 8 },
    pairKey: { flex: 1, textAlign: 'left' },
    pairValue: { flex: 1, textAlign: 'left' },
    questionmainContainer: {marginTop: 10,padding: 10,borderRadius:8,backgroundColor: '#fff',},
    questionText: {fontSize: 16,fontWeight: 'bold',color:'black',marginBottom: 10,},
    titleText:{fontSize: 18,fontWeight: 'bold',marginBottom: 10,color:'#663399',textAlign:'center'},
    imageBackground: { flex: 1, padding: 10, backgroundColor:'white' },
    imageWithOpacity: { opacity: 0.1 },
    boldText: {fontWeight: 'bold',color:'black'},
    content:{color:'black'}
})