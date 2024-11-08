import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, BackHandler, Dimensions } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

export default function TestResultScreen() {
  const { colors } = useTheme();
  const [fontSize, setFontSize] = useState(26);
  const [isWrapped, setIsWrapped] = useState(false);
  const text = "Marks Obtained = ";
  const formula = "( Solved x 4 ) - ( Wrong x 5 )";
  const [name, setName] = useState('');
  const navigation = useNavigation<any>();
  const searchdata: any = useRoute().params;

  const onLoginPressed = () => {
    navigation.navigate('Review', {
      myexamid: searchdata.myexamid,
    });
  };

  useEffect(() => {
    const adjustFontSize = () => {
      const { width } = Dimensions.get('window');
      let calculatedFontSize = 26;
      const maxWidth = width;
      while (calculatedFontSize >= 12) {
        const textWidth = calculatedFontSize * (text.length + formula.length) * 0.50;
        if (textWidth <= maxWidth) {
          break;
        }
        calculatedFontSize -= 1;
      }

      setFontSize(calculatedFontSize);
    };

    adjustFontSize();

    const subscription = Dimensions.addEventListener('change', adjustFontSize);
    
    return () => {
      subscription.remove();
    };
  }, []);
  const handleTextLayout = (event: any) => {
    const { width: textWidth } = event.nativeEvent.layout;
    const screenWidth = Dimensions.get('window').width;

    if (textWidth > screenWidth) {
      setIsWrapped(true);
    } else {
      setIsWrapped(false);
    }
  };
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('HomeScreen');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('authName');
        if (storedName !== null) {
          setName(storedName);
        }
      } catch (error) {
        console.error('Failed to fetch the name:', error);
      }
    };

    fetchName();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 18, fontWeight: 'bold',color:'black' }}>Name :- {name}</Text>
      <View style={styles.statusContainer}>
        <View style={styles.table}>
          <View style={styles.gridRow}>
            <Text style={[styles.gridCell, styles.tableHeader]}>Test Name</Text>
            <Text style={[styles.gridCell, styles.tableHeader]}>Total Qs</Text>
            <Text style={[styles.gridCell, styles.tableHeader]}>Total Marks</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={[styles.gridCell,styles.content]}>{searchdata.name}</Text>
            <Text style={[styles.gridCell,styles.content]}>{searchdata.questions}</Text>
            <Text style={[styles.gridCell,styles.content]}>{Number(searchdata.questions) * Number(searchdata.correct)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <View style={styles.table}>
          <View style={styles.gridRow}>
            <Text style={[styles.gridCell, styles.tableHeader]}>Total Answered</Text>
            <Text style={[styles.gridCell, styles.tableHeader]}>Unsolved Qs</Text>
            <Text style={[styles.gridCell, styles.tableHeader]}>Correct Ans.</Text>
            <Text style={[styles.gridCell, styles.tableHeader]}>Incorrect Ans.</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={[styles.gridCell,styles.content]}>{searchdata.answered}</Text>
            <Text style={[styles.gridCell,styles.content]}>{searchdata.unsolved}</Text>
            <Text style={[styles.gridCell,styles.content]}>{searchdata.correctans}</Text>
            <Text style={[styles.gridCell,styles.content]}>{searchdata.incorrect}</Text>
          </View>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <View style={styles.table}>
          <View style={styles.gridRow}>
            <Text style={[styles.gridCell, styles.tableHeader]}>Marks Obtained</Text>
            <Text style={[styles.gridCell, styles.tableHeader]}>Percentage</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={[styles.gridCell,styles.content]}>{searchdata.marksobtained}</Text>
            <Text style={[styles.gridCell,styles.content]}>{searchdata.percentage}</Text>
          </View>
        </View>
      </View>
      <View style={{ alignContent: 'center', width: '100%', alignItems: 'center', flex: 1, marginTop: 30 }}>
        <Text
          onLayout={handleTextLayout}
          style={{ fontSize, fontWeight: 'bold', flexWrap: 'nowrap',color:'black' }}
        >
          {text}
          {!isWrapped && formula}
        </Text>
        {isWrapped && (
          <Text style={{ fontSize, fontWeight: 'bold',color:'black' }}>
            {formula}
          </Text>
        )}
      </View>
      <Button style={{ width: '100%' }} mode="contained" onPress={onLoginPressed}>Review Question</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
  },
  content:{
    color:'black'
  },
  statusContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    textAlign: 'center',
    alignContent: 'center',
  },
  gridCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    textAlign: 'center',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    color:'black'
  },
});
