import React, { useState, useEffect, useCallback } from 'react';
import { ListRenderItem, StyleSheet, View, Text, TouchableOpacity, Modal, Dimensions, FlatList } from 'react-native';
import { TabsProvider, Tabs, TabScreen } from 'react-native-paper-tabs';
import { BASE_URL, Exam } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Button, Icon, IconButton, MD2Colors } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

const AllTab = ({ data }: { data: Exam[] }) => {
    const navigation = useNavigation<any>();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedExam, setSelectedExam] = useState<any>(null);

    const openModal = useCallback((exam: Exam) => {
        setSelectedExam(exam);
        setModalVisible(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    const renderItem: ListRenderItem<Exam> = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.tableparent}>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.tableHeaderCell}>Questions</Text>
                        <Text style={styles.tableCell}>{item.questions}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableHeaderCell}>Marks</Text>
                        <Text style={styles.tableCell}>{item.questions * item.correct}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableHeaderCell}>Duration</Text>
                        <Text style={styles.tableCell}>{item.duration} mins</Text>
                    </View>
                </View>
                <View style={styles.attemptSection}>
                    <Text style={styles.attemptText}>Attempt Exam</Text>
                    <IconButton icon="play-circle"  onPress={() => openModal(item)} size={34} mode='outlined' />
                    <Text style={styles.attemptsLeftText}>Attempts Left: {item.left}</Text>
                </View>
            </View>
        </View>
    );
    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Exams Available</Text>
            </View>
        );
    }
    return (
        <View style={styles.tabContainer}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
            />
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
                animationType='fade'>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ready to Start the Exam?</Text>
                        <Text style={{color:'black'}}>Vision Ayurved is meant to offer practice for students who appearing online exam for PG entrance of 
                            various faculties suggestions of answer and/or questions and guidance on various steps/aspects related 
                            to online exam service are purely meant for academic and practice purposes Vision Ayurved are not responsible
                            for queries regarding confirmation of answer ambiguity about answer some questions pattern of questions asked in any of 
                            online exam offered for the study for further confirmation of the answer of question student are requested to refer 
                            authorised Textbooks Sumitas for authorized Textbooks Samhitas from authorized resources it is sole discretion of students either
                            to register or not register from this online practice exam. The question banks displayed in the portal are not exhaustive
                            and meant for preliminary practice for online exam only. We are in any way not responsible for the contents. 
                            Vision Ayurved PVT LTD will put in best efforts to provide valid data in regards to scientific information, qualities
                            of questions, education, and training among Students who are appearing for any competitive exam. Please note all questions 
                            will appear in your default language.</Text>
                        <View style={styles.modalButtons}>
                            <Button mode='contained' theme={{ colors: { primary: 'red' } }} onPress={closeModal}>Cancel</Button>
                            <Button mode='contained' theme={{ colors: { primary: 'green' } }} onPress={() => {
                                closeModal();
                                if (selectedExam) {
                                    navigation.navigate('Exam', {
                                        qbid: selectedExam.qbid,
                                        examid: selectedExam.examid,
                                        name: selectedExam.title,
                                        time: selectedExam.duration,
                                        correct: selectedExam.correct,
                                        questions: selectedExam.questions,
                                    });
                                }
                            }}>Accept & Proceed</Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
const formatDate = (dateString: any) => {
    const options:any = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options);
};
const SolvedTab = ({ data }: { data: Exam[] }) => {
    const navigation = useNavigation<any>();

    const renderItem: ListRenderItem<Exam> = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={{flex:1,flexDirection:'row',justifyContent:'space-between',backgroundColor:'#316FF6'}}>
                <Text style={[styles.title, { flexShrink: 1}]}>{item.title}</Text>
                <Text style={[styles.title, { flexGrow: 1, textAlign: 'right' }]}>{item.submitted ? formatDate(item.submitted) : ''}</Text>
            </View>
            <View style={styles.tableparent}>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.tableHeaderCell}>Questions</Text>
                        <Text style={styles.tableCell}>{item.questions}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableHeaderCell}>Marks</Text>
                        <Text style={styles.tableCell}>{item.marks}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableHeaderCell}>Duration</Text>
                        <Text style={styles.tableCell}>{item.duration} mins</Text>
                    </View>
                </View>
                <View style={styles.attemptSection}>
                    <Text style={styles.attemptText}>Review Exam</Text>
                    <IconButton 
                        icon="motion-play" 
                        size={44} 
                        onPress={() => {
                            navigation.navigate('Review', {
                                myexamid:item.myexamid
                            });
                        }}
                    />
                </View>
            </View>
        </View>
    );
    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Exams Available</Text>
            </View>
        );
    }
    return (
        <View style={styles.tabContainer}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};
export default function PaidTestListScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const searchdata: any = route.params;
    const [allFree, setAllFree] = useState<Exam[]>([]);
    const [solved, setSolved] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        navigation.setOptions({ title: searchdata.name + ' Paid Test' });
    }, [searchdata.name, navigation]);
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const response = await fetch(`${BASE_URL}getPaidTests&id=${searchdata.id}&token=${token}`);
                const result = await response.json();
                setAllFree(result.allFree);
                setSolved(result.solved);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, [searchdata.id]);
    if (loading) {
        return (
            <View style={[styles.container,{justifyContent:'center'}]}>
                <ActivityIndicator size={100} animating={true} />
            </View>
        );
    }
    return (
        <TabsProvider defaultIndex={0}>
            <Tabs>
                <TabScreen label="All">
                    <AllTab data={allFree} />
                </TabScreen>
                <TabScreen label="Solved">
                    <SolvedTab data={solved} />
                </TabScreen>
            </Tabs>
        </TabsProvider>
    );
}
const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: 'black',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tabLabel: {
        color: 'black',
        fontSize: 14,
        textTransform: 'none',
        fontWeight: 'bold',
    },
    tabBar: {
        backgroundColor: 'transparent',
    },
    indicator: {
        backgroundColor: '#0c4dda',
        height: 2,
    },
    tabContainer: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f0f0',
    },
    listContainer: {
        paddingBottom: 16,
    },
    itemContainer: {
        marginVertical:4,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        padding: 8,
        fontWeight: 'bold',
        backgroundColor:'#316FF6',
        color:'white'
    },
    tableparent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    table: {
        margin:5,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableHeader: {
        backgroundColor: '#f5f5f5',
    },
    tableCell: {
        flex: 1,
        textAlign: 'right',
        color:'black'
    },
    attemptSection: {
        flex: 1,
        alignItems: 'center',
    },
    attemptText: {
        fontSize: 16,
        fontWeight: 'bold',
        color:'black'
    },
    attemptsLeftText: {
        fontSize: 14,
        color: 'black',
    },
    iconContainer: {
        backgroundColor: '#0c4dda',
        padding: 8,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
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
        marginBottom: 10,
        color:'black'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    tableHeaderCell: {
        flex: 1,
        textAlign: 'left',
        fontWeight:'bold',
        color:'black'
    },
});