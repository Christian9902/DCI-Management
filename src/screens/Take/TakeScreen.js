import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, Pressable, TouchableOpacity } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { collection, getDocs, addDoc, writeBatch, doc, updateDoc, increment } from 'firebase/firestore';


export default function TakeStockScreen(props) {
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
          <Pressable onPress={() => {setNama(""); handleNamaChange("")}}>
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
        const ref = doc.id;
        const namaBarang = data?.NamaBarang;
        const namaSupplier = data?.NamaSupplier;
        const jumlah = data?.Jumlah;
        const status = data?.Status;
        const taken = 0;
        if (namaBarang) {
          barangArray.push({
            ref,
            NamaBarang: namaBarang,
            NamaSupplier: namaSupplier,
            Jumlah: jumlah,
            Status: status,
            taken,
          });
        }
      });
  
      barangArray.sort((a, b) => {
        const productNameA = a.NamaBarang.toLowerCase();
        const productNameB = b.NamaBarang.toLowerCase();
        const supplierNameA = a.NamaSupplier.split('- ')[1]?.toLowerCase();
        const supplierNameB = b.NamaSupplier.split('- ')[1]?.toLowerCase();
  
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
          if (filterNamaBarang.length > 0 && !filterNamaBarang.some((nama) => item.NamaBarang.toLowerCase().includes(nama))) {
            return false;
          }
          if (filterNamaSupplier.length > 0 && !filterNamaSupplier.some((nama) => item.NamaSupplier.toLowerCase().includes(nama))) {
            return false;
          }
          return true;
        } else {
          if (filterBaru === 'baru' && !item.Status) {
            return false;
          }
          if (filterBaru === 'sisa' && item.Status) {
            return false;
          }
          if (filterNamaBarang.length > 0 && !filterNamaBarang.some((nama) => item.NamaBarang.toLowerCase().includes(nama))) {
            return false;
          }
          if (filterNamaSupplier.length > 0 && !filterNamaSupplier.some((nama) => item.NamaSupplier.toLowerCase().includes(nama))) {
            return false;
          }
          return true;
        }
      });
    }
  
    setNamaBarangRekomendasi(filteredBarang);
  };

  const handleIncreaseQuantity = (item) => {
    const updatedData = barangData.map((barangItem) => {
      if (barangItem === item) {
        return { ...barangItem, taken: barangItem.taken + 1 };
      }
      return barangItem;
    });
    setBarangData(updatedData);
    setNamaBarangRekomendasi(updatedData);
  };
  
  const handleDecreaseQuantity = (item) => {
    if (item.taken > 0) {
      const updatedData = barangData.map((barangItem) => {
        if (barangItem === item) {
          return { ...barangItem, taken: barangItem.taken - 1 };
        }
        return barangItem;
      });
      setBarangData(updatedData);
      setNamaBarangRekomendasi(updatedData);
    }
  };
  
  const handleTake = async () => {
    const user = auth.currentUser;
    const updatedData = [];
  
    for (const item of barangData) {
      if (item.taken > 0) {
        const newQuantity = item.Jumlah - item.taken;
        const updatedItem = { ...item, Jumlah: newQuantity };
        updatedData.push(updatedItem);
  
        try {
          const logData = {
            timestamp: new Date().toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            refID: item.ref,
            userID: user.uid,
            action: `${item.NamaBarang}'s stock has been taken`,
          };
          await addDoc(collection(db, 'Log Data'), logData);
        } catch (error) {
          console.log('Failed to log data:', error);
        }
      } else {
        updatedData.push(item);
      }
    }
  
    try {
      const batch = writeBatch(db);
    
      for (const item of updatedData) {
        const itemRef = doc(db, 'Inventory', item.ref);
        const incrementBy = -item.taken;
    
        batch.update(itemRef, { Jumlah: increment(incrementBy) });
      }
    
      await batch.commit();
    } catch (error) {
      console.log('Failed to update inventory:', error);
    }
    
    navigation.navigate('Home');
  };
  
  const renderItem = ({ item }) => {
    return(
      <View style={styles.listItem}>
        <View style={styles.itemContainer}>
          <View style={styles.itemInfoContainer}>
            <Text style={styles.title}>{item.NamaBarang}</Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{item.NamaSupplier}</Text>
            </View>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>Jumlah: {item.Jumlah}</Text>
            </View>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>Status: {item.Status ? 'Baru' : 'Sisa'}</Text>
            </View>
          </View>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleIncreaseQuantity(item)}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={item.taken.toString()}
              onChangeText={(text) => {
                const parsedValue = parseInt(text) || 0;
                const updatedData = barangData.map((barangItem) => {
                  if (barangItem === item) {
                    return { ...barangItem, taken: parsedValue };
                  }
                  return barangItem;
                });
                setBarangData(updatedData);
                setNamaBarangRekomendasi(updatedData);
                console.log(barangData[0]);
              }}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleDecreaseQuantity(item)}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        vertical
        showsVerticalScrollIndicator={false}
        data={namaBarangRekomendasi}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.NamaBarang + '-' + item.NamaSupplier + '-' + index}
      />
  
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleTake}>
          <Text style={styles.addButtonText}>Take Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );  
}