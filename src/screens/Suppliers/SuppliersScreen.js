import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Pressable, RefreshControl, ToastAndroid } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db } from '../Login/LoginScreen';
import { collection, getDocs } from 'firebase/firestore';


export default function AddStockScreen(props) {
  const [nama, setNama] = useState('');  
  const [namaSupplierRekomendasi, setNamaSupplierRekomendasi] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { navigation } = props;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <MenuImage
          onPress={() => {
            navigation.openDrawer();
          }}
        />
      ),
      headerTitle: () => (
        <View style={styles.searchContainer}>
          <Image style={styles.searchIcon} source={require("../../../assets/icons/search.png")} />
          <TextInput
            style={styles.searchInput}
            onChangeText={handleNamaChange}
            value={nama}
            placeholder='Nama Supplier / PT Supplier'
          />
          <Pressable onPress={() => {setNama(""), handleNamaChange("")}}>
            <Image style={styles.searchIcon} source={require("../../../assets/icons/close.png")} />
          </Pressable>
        </View>
      ),
      headerRight: () => <View />,
    });
  }, [nama]);

  const fetchSupplier = async () => {
    try {
      const supplierSnapshot = await getDocs(collection(db, 'Supplier'));
  
      const supplierArray = [];
      supplierSnapshot.forEach((doc) => {
        const data = doc.data();
        const namaSupplier = data?.NamaSupplier;
        const namaPTSupplier = data?.NamaPT;
        const noTelp = data?.NoTelp;
        const email = data?.Email;
        const alamat = data?.Alamat;
        const note = data?.Note
  
        if (namaSupplier) {
          supplierArray.push({
            id: doc.id,
            NamaSupplier: namaSupplier,
            NamaPT : namaPTSupplier,
            NoTelp : noTelp,
            Email : email,
            Alamat : alamat,
            Note : note,
          });
        }
      });
  
      supplierArray.sort((a, b) => {
        const supplierNameA = a.NamaSupplier.toLowerCase();
        const supplierNameB = b.NamaSupplier.toLowerCase();
  
        if (supplierNameA < supplierNameB) return -1;
        if (supplierNameA > supplierNameB) return 1;
        return 0;
      });
  
      setSupplierData(supplierArray);
      setNamaSupplierRekomendasi(supplierArray.slice(0, 10));
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };      
  
  useEffect(() => {
    fetchSupplier();
  }, []);   

  const handleNamaChange = (text) => {
    setNama(text);
    let filteredSupplier = [];
    if (text === '') {
      filteredSupplier = supplierData;
    } else {
      filteredSupplier = supplierData.filter((item) => {
        const namaSupplier = item.NamaSupplier.toLowerCase();
        const namaPTSupplier = item.NamaPT.toLowerCase();
        const filterText = text.toLowerCase().trim();
    
        return namaSupplier.includes(filterText) || namaPTSupplier.includes(filterText);
      });
    }
    setNamaSupplierRekomendasi(filteredSupplier.slice(0, 10));
  };          

  const onPressItem = (item) => {
    navigation.navigate("Supplier Update", { supplierData: item, supplierDataRef: item.id });
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    ToastAndroid.show('Refreshing...', ToastAndroid.SHORT);

    try {
      await fetchSupplier();
    } catch (error) {
      console.log('Terjadi kesalahan saat merefresh data:', error);
    }

    setRefreshing(false);
  };

  const loadMoreData = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    const nextPage = currentPage + 1;
    const startIndex = 10 * (nextPage - 1);
    const endIndex = startIndex + 10;

    setNamaSupplierRekomendasi((prevData) => [...prevData, ...supplierData.slice(startIndex, endIndex)]);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onPressItem(item)}>
      <View style={styles.listItem}>
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{item.NamaSupplier}</Text>
          <Text style={styles.category}>{item.NamaPT}</Text>
          <Text style={styles.category}>-  -  -  -  -  -  -  -  -  -  -  -  -  -  -</Text>
          <Text style={styles.category}>{item.Note}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      vertical
      showsVerticalScrollIndicator={false}
      data={namaSupplierRekomendasi}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.NamaSupplier + '-' + index}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMoreData}
      onEndReachedThreshold={0.1}
      ListFooterComponent={isLoading && <ActivityIndicator size="small" />}
    />
  );
}