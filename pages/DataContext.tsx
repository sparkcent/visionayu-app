import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { BASE_URL } from './types';

interface DataContextType {
  headerOneData: any[];
  headerTwoData: any[];
  headerThreeData: any[];
  headerFourData: any[];
  stateList: any[];
  otherList:any[];
  cityList: any[];
  whatsAppUrl: string;
  loading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [headerOneData, setHeaderOneData] = useState<any[]>([]);
  const [headerTwoData, setHeaderTwoData] = useState<any[]>([]);
  const [headerThreeData, setHeaderThreeData] = useState<any[]>([]);
  const [headerFourData, setHeaderFourData] = useState<any[]>([]);
  const [stateList, setStateList] = useState<any[]>([]);
  const [cityList, setCityList] = useState<any[]>([]);
  const [otherList, setOtherList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsAppUrl, setWhatsAppUrl] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}allData`);
        const data = await response.json();
        
        setHeaderOneData(data.headerOneList);
        setHeaderTwoData(data.headerTwoList);
        setHeaderThreeData(data.headerThreeList);
        setHeaderFourData(data.headerFourList);
        setStateList(data.stateList);
        setCityList(data.cityList);
        setOtherList(data.otherList);
        setWhatsAppUrl(data.whatsapp);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ headerOneData, headerTwoData, headerThreeData, headerFourData, stateList, cityList,otherList, loading,whatsAppUrl }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
