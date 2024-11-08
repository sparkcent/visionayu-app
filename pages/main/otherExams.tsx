import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { TabsProvider, Tabs, TabScreen } from 'react-native-paper-tabs';
import { useData } from '../DataContext';
import { Route } from '../types';
import { useNavigation } from '@react-navigation/native';


const filterData = (data: any[], headerOne: string, headerTwo: string, headerThree: string) => {
  return data.filter(item => item.header_one === headerOne && item.header_two === headerTwo && item.header_three === headerThree);
};

const DynamicContent = ({ headerOne, headerTwo, headerThree }: { headerOne: string; headerTwo: string; headerThree: string }) => {
  const { headerFourData } = useData();
  const filteredData = filterData(headerFourData, headerOne, headerTwo, headerThree);
  const navigation = useNavigation<any>();

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity style={styles.card}
        onPress={() => {
            navigation.navigate('paidTestList', { name:item.name,id:item.id } );
       }}>
      <Text style={styles.title}>{`${index + 1}. ${item.name}`}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={filteredData}
      renderItem={renderItem}
      keyExtractor={(item) => item.value.toString()}
      contentContainerStyle={styles.contentContainer}
      style={styles.flatList}
    />
  );
};

const NestedTabs = ({ headerOne, headerTwo }: { headerOne: string; headerTwo: string }) => {
  const [nestedIndex, setNestedIndex] = useState(0);
  const [nestedRoutes, setNestedRoutes] = useState<Route[]>([]);
  const { headerThreeData } = useData();

  useEffect(() => {
    const fetchNestedRoutes = () => {
      const filteredHeaderThree = headerThreeData.filter(item => item.header_one === headerOne && item.header_two === headerTwo);
      const formattedRoutes = filteredHeaderThree.map((item: any) => ({ key: item.value.toString(), title: item.name }));
      setNestedRoutes(formattedRoutes);
    };

    fetchNestedRoutes();
  }, [headerOne, headerTwo, headerThreeData]);

  if (nestedRoutes.length === 0) {
    return <ActivityIndicator size="large" color="#0c4dda" style={styles.loading} />;
  }

  return (
    <TabsProvider defaultIndex={nestedIndex}>
      <Tabs>
        {nestedRoutes.map((route: Route) => (
          <TabScreen key={route.key} label={route.title}>
            <DynamicContent headerOne={headerOne} headerTwo={headerTwo} headerThree={route.key} />
          </TabScreen>
        ))}
      </Tabs>
    </TabsProvider>
  );
};

const YearTabs = ({ headerOne }: { headerOne: string }) => {
  const [yearIndex, setYearIndex] = useState(0);
  const [yearRoutes, setYearRoutes] = useState<Route[]>([]);
  const { headerTwoData } = useData();

  useEffect(() => {
    const fetchYearRoutes = () => {
      const filteredHeaderTwo = headerTwoData.filter(item => item.header_one === headerOne);
      let formattedRoutes = filteredHeaderTwo.map((item: any) => ({ key: item.value.toString(), title: item.name }));
      formattedRoutes = formattedRoutes.map(route => {
        switch (route.title) {
          case "First Year":
            return { ...route, title: "1st Yr" };
          case "Second Year":
            return { ...route, title: "2nd Yr" };
          case "Third Year":
            return { ...route, title: "3rd Yr" };
          case "Forth Year":
            return { ...route, title: "4th Yr" };
          default:
            return route;
        }
      });
      setYearRoutes(formattedRoutes);
    };

    fetchYearRoutes();
  }, [headerOne, headerTwoData]);

  if (yearRoutes.length === 0) {
    return <ActivityIndicator size="large" color="#0c4dda" style={styles.loading} />;
  }
  return (
    <TabsProvider defaultIndex={yearIndex}>
      <Tabs >
        {yearRoutes.map((route: Route) => (
          <TabScreen key={route.key} label={route.title}>
            <NestedTabs headerOne={headerOne} headerTwo={route.key} />
          </TabScreen>
        ))}
      </Tabs>
    </TabsProvider>
  );
};

const OtherExamScreen = () => {
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState<Route[]>([]);
  const { otherList, loading } = useData();

  useEffect(() => {
    const fetchRoutes = () => {
      const formattedRoutes = otherList.map((item: any) => ({ key: item.value.toString(), title: item.name }));
      setRoutes(formattedRoutes);
    };
    fetchRoutes();
  }, [otherList]);

  if (loading || routes.length === 0) {
    return <ActivityIndicator size="large" color="#0c4dda" style={styles.loading} />;
  }

  return (
    <TabsProvider defaultIndex={index}>
      <Tabs>
        {routes.map((route: Route) => (
          <TabScreen key={route.key} label={route.title}>
            <YearTabs headerOne={route.key} />
          </TabScreen>
        ))}
      </Tabs>
    </TabsProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  tabLabel: {
    color: 'black',
    fontSize: 14,
    textTransform: 'none',
    fontWeight: 'bold',
  },
  tabIndicator: {
    backgroundColor: '#0c4dda',
    height: 2,
  },
  tabBar: {
    backgroundColor: 'transparent',
  },
  card: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 8,
    marginTop:5,
    borderRadius: 8,
    elevation: 3,
  },
  index: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontWeight: 'bold',
    color:'black'
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
  },
});

export default OtherExamScreen;