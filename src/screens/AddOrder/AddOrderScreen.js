import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const dummyNamaBarang = ['Barang 1', 'Barang 2', 'Barang 3', 'Barang 4', 'Barang 5'];

const dummySupplier = ['Supplier 1', 'Supplier 2', 'Supplier 3', 'Supplier 4', 'Supplier 5'];

export default function AddOrderScreen(props) {
  const [nama, setNama] = useState('');
  const [supplier, setSupplier] = useState('');
  const [jumlah, setJumlah] = useState(0);
  const [foto, setFoto] = useState(null);
  const [keterangan, setKeterangan] = useState('');
  const [barangBaru, setBarangBaru] = useState(true);
  const [barangSisa, setBarangSisa] = useState(false);
  const [isNamaActive, setIsNamaActive] = useState(false); 
  const [isSupplierActive, setIsSupplierActive] = useState(false); 
  const [namaBarangRekomendasi, setNamaBarangRekomendasi] = useState([]);
  const [supplierRekomendasi, setSupplierRekomendasi] = useState([]);

  const { navigation } = props;

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

  const handleAddStock = async () => {
    const data = {
      nama: nama,
      supplier: supplier,
      jumlah: jumlah,
      foto: foto,
      keterangan: keterangan,
      barangBaru: barangBaru,
      barangSisa: barangSisa,
    };
  
    try {
      const docRef = await addDoc(collection(db, 'record'), data);
      console.log('Data berhasil disimpan di Firestore dengan ID:', docRef.id);
    } catch (error) {
      console.log('Terjadi kesalahan saat menyimpan data ke Firestore:', error);
    }
  
    setNama('');
    setSupplier('');
    setJumlah(0);
    setFoto(null);
    setKeterangan('');
  
    if (!barangBaru) {
      setBarangBaru(true);
      setBarangSisa(false);
    }
  
    navigation.navigate('Home');
  };    

  const handleCancel = () => {
    setNama('');
    setSupplier('');
    setJumlah(0);
    setFoto(null);
    setKeterangan('');

    if (!barangBaru) {
      setBarangBaru(true);
      setBarangSisa(false);
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
    const filteredNamaBarang = dummyNamaBarang.filter((item) =>
      item.toLowerCase().includes(text.toLowerCase())
    );
    setNamaBarangRekomendasi(filteredNamaBarang);
  };

  const handleSupplierChange = (text) => {
    setSupplier(text);
    const filteredSupplier = dummySupplier.filter((item) =>
      item.toLowerCase().includes(text.toLowerCase())
    );
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
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Nama Supplier"
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
        />
      )}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => {
          setBarangBaru(!barangBaru);
          setBarangSisa(!barangSisa);
        }}
      >
        <Text style={styles.checkboxText}>Barang Baru?</Text>
        <Text style={styles.checkboxIcon}>{barangBaru ? '✓' : ''}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => {
          setBarangBaru(!barangBaru);
          setBarangSisa(!barangSisa);
        }}
      >
        <Text style={styles.checkboxText}>Barang Sisa?</Text>
        <Text style={styles.checkboxIcon}>{barangSisa ? '✓' : ''}</Text>
      </TouchableOpacity>
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
      <TouchableOpacity style={styles.addButton} onPress={handleAddStock}>
        <Text style={styles.addButtonText}>Add Stock</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}