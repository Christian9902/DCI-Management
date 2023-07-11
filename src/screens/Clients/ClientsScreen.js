import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Pressable } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db } from '../Login/LoginScreen';
import { collection, getDocs } from 'firebase/firestore';


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
            placeholder='Nama Client / PT Client'
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
        const Ref = doc.id;
        const NamaClient = data?.NamaClient;
        const NamaPT = data?.NamaPT;
        const Progress = data?.Progress;
        const Alamat = data?.Alamat;
        const By = data?.By;
        const Email = data?.Email;
        const NoTelp = data?.NoTelp;
        const Note = data?.Note;
        const Quo = data?.QuoSubmitted;
        const Job = data?.JobPosition;
  
        const user = userSnapshot.docs.find((doc) => doc.id === data?.PIC);
        const PIC = user ? user.data().Nama : '';
  
        if (NamaClient) {
          clientArray.push({
            Ref,
            NamaClient,
            NamaPT,
            Progress,
            PIC,
            Alamat,
            By,
            Email,
            NoTelp,
            Note,
            Quo,
            Job,
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
    setNama(text);
    let filteredClient = [];
    if (text === '') {
      filteredClient = clientData;
    } else {
      filteredClient = clientData.filter((item) => {
        const namaClient = item.NamaClient.toLowerCase();
        const namaPT = item.NamaPT.toLowerCase();
        const filterText = text.toLowerCase().trim();
    
        return namaClient.includes(filterText) || namaPT.includes(filterText);
      });
    }
    setNamaClientRekomendasi(filteredClient);
  };          

  const onPressItem = (item) => {
    navigation.navigate("Client Update", { clientData: item, clientDataRef: item.id });
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
      keyExtractor={(item, index) => item.NamaClient + '-' + item.NamaPT + '-' + index}
    />
  );
}