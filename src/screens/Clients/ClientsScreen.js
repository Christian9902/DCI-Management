import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Pressable } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { doc, updateDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';


export default function AddStockScreen(props) {
  const [nama, setNama] = useState('');  
  const [namaClientRekomendasi, setNamaClientRekomendasi] = useState([]);
  const [clientData, setClientData] = useState([]);

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
            placeholder='Baru/Sisa; Barang1, Barang2, ...; Supplier1, ...'
          />
          <Pressable onPress={() => {setNama(""), handleNamaChange("")}}>
            <Image style={styles.searchIcon} source={require("../../../assets/icons/close.png")} />
          </Pressable>
        </View>
      ),
      headerRight: () => <View />,
    });
  }, [nama]);

  const fetchClient = async () => {
    try {
      const clientSnapshot = await getDocs(collection(db, 'Client'));
      const userSnapshot = await getDocs(collection(db, 'Users'));
  
      const clientArray = [];
      clientSnapshot.forEach((doc) => {
        const data = doc.data();
        const NamaClient = data?.NamaClient;
        const NamaPT = data?.NamaPT;
        const Progress = data?.Progress;
  
        const user = userSnapshot.docs.find((doc) => doc.id === data?.PIC);
        const PIC = user ? user.data().Nama : '';
  
        if (NamaClient) {
          clientArray.push({
            NamaClient,
            NamaPT,
            Progress,
            PIC,
          });
        }
      });
  
      clientArray.sort((a, b) => {
        const clientNameA = a.NamaClient.toLowerCase();
        const clientNameB = b.NamaClient.toLowerCase();
        const clientPTNameA = a.NamaPT.split('- ')[1]?.toLowerCase();
        const clientPTNameB = b.NamaPT.split('- ')[1]?.toLowerCase();
  
        if (clientNameA < clientNameB) return -1;
        if (clientNameA > clientNameB) return 1;
        if (clientPTNameA < clientPTNameB) return -1;
        if (clientPTNameA > clientPTNameB) return 1;
        return 0;
      });
  
      setClientData(clientArray);
      setNamaClientRekomendasi(clientArray);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };      
  
  useEffect(() => {
    fetchClient();
  }, []);   

  const handleNamaChange = (text) => {
    /*
    setNama(text);
    let filteredClient = [];
  
    if (text === '') {
      filteredClient = clientData;
    } else {
      const filterText = text.toLowerCase().trim();
      const filterItems = filterText.split(';').map((item) => item.trim());
      const filterBaru = filterItems[0].toLowerCase();
      const filterNamaClient = filterItems[1] ? filterItems[1].split(',').map((item) => item.trim().toLowerCase()) : [];
      const filterNamaSupplier = filterItems[2] ? filterItems[2].split(',').map((item) => item.trim().toLowerCase()) : [];
  
      filteredClient = clientData.filter((item) => {
        if (filterBaru !== 'baru' && filterBaru !== 'sisa') {
          if (filterNamaClient.length > 0 && !filterNamaClient.some((nama) => item.namaClient.toLowerCase().includes(nama))) {
            return false;
          }
          if (filterNamaSupplier.length > 0 && !filterNamaSupplier.some((nama) => item.namaSupplier.toLowerCase().includes(nama))) {
            return false;
          }
          return true;
        } else {
          if (filterBaru === 'baru' && !item.status) {
            return false;
          }
          if (filterBaru === 'sisa' && item.status) {
            return false;
          }
          if (filterNamaClient.length > 0 && !filterNamaClient.some((nama) => item.namaClient.toLowerCase().includes(nama))) {
            return false;
          }
          if (filterNamaSupplier.length > 0 && !filterNamaSupplier.some((nama) => item.namaSupplier.toLowerCase().includes(nama))) {
            return false;
          }
          return true;
        }
      });
    }
  
    setNamaClientRekomendasi(filteredClient);
    */
  };        

  const onPressItem = (item) => {
    navigation.navigate("Home");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onPressItem(item)}>
      <View style={styles.listItem}>
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{item.NamaClient}</Text>
          <Text style={styles.category}>{item.NamaPT}</Text>
          <Text>-  -  -  -  -  -  -  -  -  -  -  -  -  -  -</Text>
          <Text style={styles.category}>Status: {item.Progress}</Text>
          <Text style={styles.category}>PIC: {item.PIC}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      vertical
      showsVerticalScrollIndicator={false}
      data={namaClientRekomendasi}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.namaClient + '-' + item.namaSupplier + '-' + index}
    />
  );
}