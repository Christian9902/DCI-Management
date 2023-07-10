import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Pressable } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { doc, updateDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';


export default function AddStockScreen(props) {
  const [nama, setNama] = useState('');  
  const [namaBarangRekomendasi, setNamaBarangRekomendasi] = useState([]);
  const [barangData, setBarangData] = useState([]);

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
          />
          <Pressable onPress={() => {setNama(""), handleNamaChange("")}}>
            <Image style={styles.searchIcon} source={require("../../../assets/icons/close.png")} />
          </Pressable>
        </View>
      ),
      headerRight: () => <View />,
    });
  }, [nama]);

  const fetchInventory = async () => {
    try {
      const inventorySnapshot = await getDocs(collection(db, 'Inventory'));
      const barangArray = [];
      inventorySnapshot.forEach((doc) => {
        const data = doc.data();
        const namaBarang = data?.NamaBarang;
        const namaSupplier = data?.NamaSupplier;
        const jumlah = data?.Jumlah;
        const status = data?.Status;
        if (namaBarang) {
          barangArray.push({
            namaBarang,
            namaSupplier,
            jumlah,
            status,
          });
        }
      });
      setBarangData(barangArray);
      setNamaBarangRekomendasi(barangArray);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };    
  
  useEffect(() => {
    fetchInventory();
  }, []);   

  const handleNamaChange = (text) => {
    setNama(text);
    let filteredBarang = [];
    
    if (text === '') {
      filteredBarang = barangData;
    } else {
      filteredBarang = barangData.filter((item) =>
        item.namaBarang.toLowerCase().includes(text.toLowerCase())
      );
    }
  
    setNamaBarangRekomendasi(filteredBarang);
  };  

  const onPressItem = (item) => {
    navigation.navigate("Home");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onPressItem(item)}>
      <View style={styles.listItem}>
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{item.namaBarang}</Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{item.namaSupplier}</Text>
          </View>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>Jumlah: {item.jumlah}</Text>
          </View>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>Status: {item.status ? 'Baru' : 'Sisa'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        vertical
        showsVerticalScrollIndicator={false}
        data={namaBarangRekomendasi}
        renderItem={renderItem}
        keyExtractor={(item) => item.namaBarang}
      />
    </View>
  );
}