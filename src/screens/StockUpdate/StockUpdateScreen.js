import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ToastAndroid } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { updateDoc, addDoc, collection, getDocs, doc } from 'firebase/firestore';

export default function StockUpdateScreen({ navigation, route }) {
  const { stockData } = route.params;
  const [nama, setNama] = useState(stockData.namaBarang);
  const [supplier, setSupplier] = useState(stockData.namaSupplier);
  const [jumlah, setJumlah] = useState(stockData.jumlah);
  const [keterangan, setKeterangan] = useState(stockData.keterangan);
  const [barangBaru, setBarangBaru] = useState(stockData.status);
  const [price, setPrice] = useState(stockData.harga);
  const [isNamaActive, setIsNamaActive] = useState(false); 
  const [isSupplierActive, setIsSupplierActive] = useState(false); 
  const [namaBarangRekomendasi, setNamaBarangRekomendasi] = useState([]);
  const [supplierRekomendasi, setSupplierRekomendasi] = useState([]);
  const [namaBarangList, setNamaBarangList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleStyle: {
        top: 0,
      },
      headerLeft: () => (
        <MenuImage
          onPress={() => {
            navigation.openDrawer();
          }}
        />
      ),
      headerRight: () => <View />,
    });
  }, []);

  const fetchInventory = async () => {
    try {
      const inventorySnapshot = await getDocs(collection(db, 'Inventory'));
      const namaBarangSet = new Set();
      inventorySnapshot.forEach((doc) => {
        const data = doc.data();
        const namaBarang = data?.NamaBarang;
        if (namaBarang) {
          namaBarangSet.add(namaBarang);
        }
      });
      const namaBarangArray = Array.from(namaBarangSet).sort();
      setNamaBarangList(namaBarangArray);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };

  const fetchSupplier = async () => {
    try {
      const supplierSnapshot = await getDocs(collection(db, 'Supplier'));
      const supplierSet = new Set();
      const PTSet = new Set();
      const mixArray = [];
      supplierSnapshot.forEach((doc) => {
        const data = doc.data();
        const namaSupplier = data?.NamaSupplier;
        if (namaSupplier) {
          supplierSet.add(namaSupplier);
        }
        const namaPT = data?.NamaPT;
        if (namaPT) {
          PTSet.add(namaPT);
        }
      });
      const supplierArray = Array.from(supplierSet);
      const PTArray = Array.from(PTSet);
      supplierArray.forEach((supplier, index) => {
        const PT = PTArray[index] || '';
        const mix = `${supplier} - ${PT}`;
        mixArray.push(mix);
      });
      setSupplierList(mixArray);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };    
  
  useEffect(() => {
    fetchInventory();
    fetchSupplier();
  }, []);

  const handleUpdateStock = async () => {
    const user = auth.currentUser;
    const inventoryRef = doc(db, 'Inventory', stockData.stockID);
    const logDataRef = collection(db, 'Log Data');
    const time = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  
      try {
        await updateDoc(inventoryRef, { 
          NamaBarang: nama,
          NamaSupplier: supplier,
          Status: barangBaru,
          Jumlah: jumlah,
          Keterangan: keterangan,
          Harga: price,
        });
        ToastAndroid.show('Stock berhasil diupdate', ToastAndroid.SHORT);

        const logEntry = {
          timestamp: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          action: 'updating Stock',
          userID: user.uid,
          refID: stockData.stockID,
        };
        await addDoc(logDataRef, logEntry);
      } catch (error) {
        ToastAndroid.show(`Terjadi error saat menyimpan data: ${error}`, ToastAndroid.SHORT);
      }

    navigation.navigate('Home');
  };

  const handleIncreaseJumlah = () => {
    if (jumlah === '') {
      setJumlah(1);
    } else {
      setJumlah(jumlah + 1);
    }
  };
  
  const handleDecreaseJumlah = () => {
    if (jumlah > 0) {
      setJumlah(jumlah - 1);
    }
  };

  const handleNamaChange = (text) => {
    setNama(text);
    let filteredNamaBarang = namaBarangList.filter((item) =>
      item.toLowerCase().includes(text.toLowerCase())
    );
    if (text === '') {
      filteredNamaBarang = [];
    }
    setNamaBarangRekomendasi(filteredNamaBarang);
  };
  
  const handleSupplierChange = (text) => {
    setSupplier(text);
    let filteredSupplier = supplierList.filter((item) =>
      item.toLowerCase().includes(text.toLowerCase())
    );
    if (text === '') {
      filteredSupplier = [];
    }
    setSupplierRekomendasi(filteredSupplier);
  };

  const renderNamaBarangRekomendasi = ({ item }) => (
    <TouchableOpacity onPress={() => setNama(item)}>
      <Text style={styles.rekomendasiText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSupplierRekomendasi = ({ item }) => (
    <TouchableOpacity onPress={() => setSupplier(item)}>
      <Text style={styles.rekomendasiText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nama Barang"
        value={nama}
        onChangeText={handleNamaChange}
        autoCompleteType="off"
        autoCorrect={false}
        dataDetectorTypes="none"
        spellCheck={false}
        onFocus={() => setIsNamaActive(true)}
        onBlur={() => setIsNamaActive(false)}
      />
      {isNamaActive && namaBarangRekomendasi.length > 0 && (
        <FlatList
          data={namaBarangRekomendasi}
          renderItem={renderNamaBarangRekomendasi}
          keyExtractor={(item) => item}
          style={styles.rekomendasiContainer}
          keyboardShouldPersistTaps="always"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Nama Supplier - PT Supplier"
        value={supplier}
        onChangeText={handleSupplierChange}
        autoCompleteType="off"
        autoCorrect={false}
        dataDetectorTypes="none"
        spellCheck={false}
        onFocus={() => setIsSupplierActive(true)}
        onBlur={() => setIsSupplierActive(false)}
      />
      {isSupplierActive && supplierRekomendasi.length > 0 && (
        <FlatList
          data={supplierRekomendasi}
          renderItem={renderSupplierRekomendasi}
          keyExtractor={(item) => item}
          style={styles.rekomendasiContainer}
          keyboardShouldPersistTaps="always"
        />
      )}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => {
          setBarangBaru(!barangBaru);
        }}
      >
        <Text style={styles.checkboxText}>Barang Baru?</Text>
        <Text style={styles.checkboxIcon}>{barangBaru ? '✓' : ''}</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Harga Satuan"
        value={price.toString()}
        onChangeText={(text) => setPrice(parseInt(text) || '')}
        keyboardType="numeric"
      />
      <View style={styles.jumlahContainer}>
        <Text style={styles.jumlahText}>Jumlah</Text>
        <View style={styles.jumlahContainer2}>
          <TouchableOpacity style={styles.jumlahButton} onPress={handleIncreaseJumlah}>
            <Text style={styles.jumlahButtonText}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.jumlahInput}
            value={jumlah.toString()}
            onChangeText={(text) => setJumlah(parseInt(text) || '')}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.jumlahButton} onPress={handleDecreaseJumlah}>
            <Text style={styles.jumlahButtonText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TextInput
        style={styles.additionalInfoInput}
        placeholder="Keterangan Tambahan"
        value={keterangan}
        onChangeText={setKeterangan}
        multiline={true}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleUpdateStock}>
        <Text style={styles.addButtonText}>Update</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => (navigation.navigate('Home'))}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}