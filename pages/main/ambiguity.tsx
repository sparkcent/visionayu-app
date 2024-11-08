import { StyleSheet, View, Text, FlatList } from 'react-native';
import { BASE_URL, Question } from '../types';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button } from 'react-native-paper';

export default function AmbiguityScreen() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [resolvedCount, setResolved] = useState(0);
    const [unresolvedCount, setUnresolved] = useState(0);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [filter, setFilter] = useState<'resolved' | 'unresolved'>('resolved');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchQuestions();
    }, []);
    
    useEffect(() => {
        applyFilter();
    }, [filter, questions]);

    const applyFilter = () => {
        if (filter === 'resolved') {
            setFilteredQuestions(questions.filter((item: any) => item.status === 'resolved'));
        } else if (filter === 'unresolved') {
            setFilteredQuestions(questions.filter((item: any) => item.status === 'unresolved'));
        } else {
            setFilteredQuestions(questions);
        }
    };
    const fetchQuestions = async () => {
        fetch(`${BASE_URL}getAmbuigity`).then(response =>
            response.json()
        ).then(data => {
            setQuestions(data);
            const resolvedCount = data.filter((item: any) => item.status === 'resolved').length;
            const unresolvedCount = data.filter((item: any) => item.status === 'unresolved').length;
            setResolved(resolvedCount);
            setUnresolved(unresolvedCount);
            setLoading(false);
        });
    }
    const formatOption = (option: any) => {
        if (option && option.length > 6) {
            return option.slice(0, 6) + ' ' + option.slice(6);
        }
        return option;
    };
    const renderQuestion = ({ item, index }: { item: Question; index: number }) => (
        <View style={styles.questionmainContainer}>
            <Text style={styles.questionText}>Q {`${index + 1}. ${item.question}`}</Text>
            {item.questionType === 'pairs' ? (
                <View>
                    {(() => {
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
                    })()}
                </View>
            ) : (
                <View></View>
            )}
            <Text style={[styles.optionText]}>{`A. ${item.optionA}`}</Text>
            <Text style={[styles.optionText]}>{`B. ${item.optionB}`}</Text>
            <Text style={[styles.optionText]}>{`C. ${item.optionC}`}</Text>
            <Text style={[styles.optionText]}>{`D. ${item.optionD}`}</Text>
            <View style={{ marginBottom: 5, flex: 1, flexDirection: 'row' }}>
                <Text style={[{ fontWeight: 'bold', color: 'black' }]}>Our Answer :- </Text>
                <Text style={[styles.content]}>{formatOption(item.correct_option)}</Text>
            </View>
            <View style={{ marginBottom: 5, flex: 1, flexDirection: 'row' }}>
                <Text style={[{ fontWeight: 'bold', color: 'black' }]}>Std. Answer :- </Text>
                <Text style={[styles.content]}>{formatOption(item.selected_option)}</Text>
            </View>
            <View style={{ marginBottom: 5, flex: 1, flexDirection: 'row' }}>
                <Text style={[{ fontWeight: 'bold', color: 'black' }]}>Std. Reference :-</Text>
                <Text style={[styles.content]}>{item.reference}</Text>
            </View>
        </View>
    );
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size={100} animating={true} />
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <View style={styles.reportContainer}>
                <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 16, marginBottom: 5 }}>Reported Questions</Text>
            </View>
            <View style={styles.statusContainer}>
                <Button mode="contained" onPress={() => setFilter('resolved')} style={{ width: '48%', backgroundColor: '#007BFF', }}>Resolved</Button>
                <Button mode="contained" onPress={() => setFilter('unresolved')} style={{ width: '48%', backgroundColor: '#ffc107', }}>Unresolved</Button>
            </View>
            {filter === 'resolved' ? (
                <Text style={styles.labelcenter}>Ambiguity will disappear after 7 days of its resolution</Text>
            ) : (<Text style={styles.labelcenter}>&nbsp;</Text>) }
            <FlatList data={filteredQuestions} renderItem={renderQuestion} keyExtractor={item => item.id.toString()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 8, backgroundColor: '#f0f0f0' },
    reportContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
    reportItem: { flex: 1, alignItems: 'center', padding: 10 },
    label: { fontSize: 12, fontWeight: 'bold', color: 'black' },
    questionmainContainer: { marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: '#fff', },
    questionText: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: 'black' },
    labelcenter: { fontSize: 12, marginTop: 5, fontWeight: 'bold', textAlign: 'center', color: 'black' },
    statusText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
    statusBoxUnresolved: { backgroundColor: '#ffc107', padding: 8, borderRadius: 8, alignItems: 'center', width: '100%', },
    statusBoxResolved: { backgroundColor: '#007BFF', padding: 8, borderRadius: 5, alignItems: 'center', },
    statusContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
    value: { fontSize: 18, marginTop: 4, color: 'black' },
    divider: { width: 1, height: '100%', backgroundColor: '#ddd', marginHorizontal: 8, },
    pairRow: { flexDirection: 'row', marginVertical: 8 },
    optionText: { fontSize: 14, marginVertical: 2, padding: 5, borderRadius: 8, overflow: 'hidden', color: 'black' },
    pairItem: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
    pairKey: { flex: 1, textAlign: 'left' },
    pairValue: { flex: 1, textAlign: 'left' },
    content: { color: 'black', fontSize: 14, },
})