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
  
      barangArray.sort((a, b) => {
        const productNameA = a.namaBarang.toLowerCase();
        const productNameB = b.namaBarang.toLowerCase();
        const supplierNameA = a.namaSupplier.split('- ')[1]?.toLowerCase();
        const supplierNameB = b.namaSupplier.split('- ')[1]?.toLowerCase();
  
        if (productNameA < productNameB) return -1;
        if (productNameA > productNameB) return 1;
        if (supplierNameA < supplierNameB) return -1;
        if (supplierNameA > supplierNameB) return 1;
        return 0;
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
      const filterText = text.toLowerCase().trim();
      const filterItems = filterText.split(';').map((item) => item.trim());
      const filterBaru = filterItems[0].toLowerCase();
      const filterNamaBarang = filterItems[1] ? filterItems[1].split(',').map((item) => item.trim().toLowerCase()) : [];
      const filterNamaSupplier = filterItems[2] ? filterItems[2].split(',').map((item) => item.trim().toLowerCase()) : [];
  
      filteredBarang = barangData.filter((item) => {
        if (filterBaru !== 'baru' && filterBaru !== 'sisa') {
          if (filterNamaBarang.length > 0 && !filterNamaBarang.some((nama) => item.namaBarang.toLowerCase().includes(nama))) {
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
          if (filterNamaBarang.length > 0 && !filterNamaBarang.some((nama) => item.namaBarang.toLowerCase().includes(nama))) {
            return false;
          }
          if (filterNamaSupplier.length > 0 && !filterNamaSupplier.some((nama) => item.namaSupplier.toLowerCase().includes(nama))) {
            return false;
          }
          return true;
        }
      });
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
    <FlatList
      vertical
      showsVerticalScrollIndicator={false}
      data={namaBarangRekomendasi}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.namaBarang + '-' + item.namaSupplier + '-' + index}
    />
  );
}