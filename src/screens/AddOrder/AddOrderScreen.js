import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ToastAndroid, Image } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { updateDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import * as DocumentPicker from 'expo-document-picker';

export default function AddOrderScreen(props) {
  const [nama, setNama] = useState('');
  const [supplier, setSupplier] = useState('');
  const [jumlah, setJumlah] = useState(0);
  const [keterangan, setKeterangan] = useState('');
  const [barangBaru, setBarangBaru] = useState(true);
  const [isNamaActive, setIsNamaActive] = useState(false); 
  const [isSupplierActive, setIsSupplierActive] = useState(false); 
  const [namaBarangRekomendasi, setNamaBarangRekomendasi] = useState([]);
  const [supplierRekomendasi, setSupplierRekomendasi] = useState([]);
  const [namaBarangList, setNamaBarangList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);

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
      headerRight: () => (
        <TouchableOpacity onPress={handleAttachment}>
          <Image
            style={styles.attachIcon}
            source={require('../../../assets/icons/attachment.png')}
          />
        </TouchableOpacity>
      ),
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

  const handleAddStock = async () => {
    const user = auth.currentUser;
    const inventoryRef = collection(db, 'Inventory');
    const logDataRef = collection(db, 'Log Data');
  
    const inventoryQuery = await getDocs(
      query(inventoryRef, where('NamaBarang', '==', nama), where('NamaSupplier', '==', supplier), where('Status', '==', barangBaru))
    );
  
    if (!inventoryQuery.empty) {
      inventoryQuery.forEach(async (doc) => {
        const existingData = doc.data();
        const existingJumlah = existingData?.Jumlah || 0;
        const newJumlah = existingJumlah + jumlah;
  
        try {
          await updateDoc(doc.ref, { Jumlah: newJumlah });
          ToastAndroid.show('Stock berhasil disimpan', ToastAndroid.SHORT);

          const logEntry = {
            timestamp: new Date().toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            action: 'Adding Stock',
            userID: user.uid,
            refID: doc.id,
          };
          await addDoc(logDataRef, logEntry);
        } catch (error) {
          ToastAndroid.show(`Terjadi error saat menyimpan data: ${error}`, ToastAndroid.SHORT);
        }
      });
  
      setNama('');
      setSupplier('');
      setJumlah(0);
      setKeterangan('');
  
      if (!barangBaru) {
        setBarangBaru(true);
      }
  
      navigation.navigate('Home');
    } else {
      const data = {
        NamaBarang: nama,
        NamaSupplier: supplier,
        Jumlah: jumlah,
        Keterangan: keterangan,
        Status: barangBaru,
      };
  
      try {
        const docRef = await addDoc(inventoryRef, data);
        console.log('Data berhasil disimpan di Firestore dengan ID:', docRef.id);

        const logEntry = {
          timestamp: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          action: barangBaru ? 'New Stock Added' : 'Remaining Production Stock Added',
          userID: user.uid,
          refID: docRef.id,
        };
        await addDoc(logDataRef, logEntry);
        console.log('Log entry added successfully.');
      } catch (error) {
        console.log('Terjadi kesalahan saat menyimpan data ke Firestore:', error);
      }
  
      setNama('');
      setSupplier('');
      setJumlah(0);
      setKeterangan('');
  
      if (!barangBaru) {
        setBarangBaru(true);
      }
  
      navigation.navigate('Home');
    }
  };   

  const handleCancel = () => {
    setNama('');
    setSupplier('');
    setJumlah(0);
    setKeterangan('');

    if (!barangBaru) {
      setBarangBaru(true);
    }
    
    navigation.navigate('Home');
  };

  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
      });
      if (result.type === 'success') {
        const selectedFiles = Array.isArray(result) ? result : [result];
        setAttachedFiles((prevAttachedFiles) => [...prevAttachedFiles, ...selectedFiles]);
      }
    } catch (error) {
      console.log('Error while picking the file:', error);
    }
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles((prevAttachedFiles) => {
      const updatedFiles = [...prevAttachedFiles];
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
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
      {attachedFiles.length > 0 && (
        <View style={styles.attachedFilesContainer}>
          <Text style={styles.attachedFilesTitle}>Attached Files:</Text>
          {attachedFiles.map((file, index) => (
            <View key={index} style={styles.attachedFileItem}>
              <View>
                <Text style={styles.attachedFileName}>
                  {file.name}
                </Text>
                <Text style={styles.attachedFileSize}>{((file.size / 1024) / 1024).toFixed(2)} MB</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                <Text style={styles.deleteButton}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={handleAddStock}>
        <Text style={styles.addButtonText}>Add Stock</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}