import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import styles from './styles'; // Import styles
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { updateDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';

// Component
export default function AddOrderScreen(props) {
  // State variables
  const [namaProject, setNamaProject] = useState('');
  const [namaBarang, setNamaBarang] = useState('');
  const [biaya, setBiaya] = useState('');
  const [supplier, setSupplier] = useState('');
  const [jumlah, setJumlah] = useState(0);
  const [keterangan, setKeterangan] = useState('');
  const [isNamaActive, setIsNamaActive] = useState(false);
  const [isSupplierActive, setIsSupplierActive] = useState(false);
  const [namaBarangRekomendasi, setNamaBarangRekomendasi] = useState([]);
  const [supplierRekomendasi, setSupplierRekomendasi] = useState([]);
  const [namaBarangList, setNamaBarangList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [deadlineProduksi, setDeadlineProduksi] = useState(new Date());
  const [deadlinePengiriman, setDeadlinePengiriman] = useState(new Date());
  const [deadlineMockup, setDeadlineMockup] = useState(new Date());
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showPengirimanPicker, setShowPengirimanPicker] = useState(false);
  const [showMockupPicker, setShowMockupPicker] = useState(false);
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [email, setEmail] = useState('');

  const { navigation } = props;

  // Function to handle attachment
  const handleAttachment = async () => {
    try {
      const response = await DocumentPicker.getDocumentAsync();
      if (response.type === 'success') {
        const { name, size } = response;
        const file = { name, size };
        setAttachedFiles([...attachedFiles, file]);
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };

  // Use layout effect for setting header options
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
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={handleAttachment} style={styles.uploadButton}>
            <Image
              style={styles.uploadButtonIcon}
              source={require('../../../assets/icons/attachment.png')}
            />
            <Text style={styles.uploadButtonText}></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} style={styles.iconButton}>
            <Image
              style={styles.iconButtonIcon}
              source={require('../../../assets/icons/another.png')} // Replace 'your_icon.png' with the actual icon image
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, []);

  // Function to handle Nama Project change
  const handleNamaProjectChange = (text) => {
    setNamaProject(text);
  };

  // Function to handle Nama Barang change
  const handleNamaBarangChange = (text) => {
    setNamaBarang(text);
  };

  // Function to handle Biaya change
  const handleBiayaChange = (text) => {
    setBiaya(text);
  };

  // Function to handle Supplier change
  const handleSupplierChange = (text) => {
    setSupplier(text);
  };

  // Function to handle increasing Jumlah
  const handleIncreaseJumlah = () => {
    setJumlah(jumlah + 1);
  };

  // Function to handle decreasing Jumlah
  const handleDecreaseJumlah = () => {
    if (jumlah > 0) {
      setJumlah(jumlah - 1);
    }
  };

  // Function to handle removing attached file
  const handleRemoveFile = (index) => {
    const updatedFiles = [...attachedFiles];
    updatedFiles.splice(index, 1);
    setAttachedFiles(updatedFiles);
  };

  // Function to handle adding stock
  const handleAddStock = () => {
    // Implementasi untuk menambahkan stok
    // Anda dapat menambahkan logika atau pemanggilan API yang sesuai di sini
    console.log("Stok ditambahkan");
    navigation.navigate('Home'); // Navigasi ke layar beranda setelah menambahkan stok
  };

  // Function to handle cancel
  const handleCancel = () => {
    // Implementasi untuk membatalkan
    // Anda dapat menambahkan logika atau navigasi yang sesuai di sini
    console.log("Dibatalkan");
    navigation.navigate('Home'); // Navigasi ke layar beranda setelah membatalkan
  };

  // Function to render Nama Barang rekomendasi
  const renderNamaBarangRekomendasi = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleSelectNamaBarang(item)}>
        <Text>{item}</Text>
      </TouchableOpacity>
    );
  };

  // Function to render Supplier rekomendasi
  const renderSupplierRekomendasi = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleSelectSupplier(item)}>
        <Text>{item}</Text>
      </TouchableOpacity>
    );
  };

  // Function to handle selecting Nama Barang from recommendations
  const handleSelectNamaBarang = (item) => {
    // Add your implementation for selecting Nama Barang here
  };

  // Function to handle selecting Supplier from recommendations
  const handleSelectSupplier = (item) => {
    // Add your implementation for selecting Supplier here
  };

  // Function to handle setting deadlineProduksi
  const handleSetDeadlineProduksi = (event, date) => {
    if (date) {
      setDeadlineProduksi(date);
    }
    setShowDeadlinePicker(false);
  };

  // Function to handle setting deadlinePengiriman
  const handleSetDeadlinePengiriman = (event, date) => {
    if (date) {
      setDeadlinePengiriman(date);
    }
    setShowPengirimanPicker(false);
  };

  // Function to handle setting deadlineMockup
  const handleSetDeadlineMockup = (event, date) => {
    if (date) {
      setDeadlineMockup(date);
    }
    setShowMockupPicker(false);
  };

  // JSX content
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nama Project"
          value={namaProject}
          onChangeText={handleNamaProjectChange}
          autoCompleteType="off"
          autoCorrect={false}
          dataDetectorTypes="none"
          spellCheck={false}
          onFocus={() => setIsNamaActive(true)}
          onBlur={() => setIsNamaActive(false)}
        />
        <TextInput
          style={styles.input}
          placeholder="Nama Barang"
          value={namaBarang}
          onChangeText={handleNamaBarangChange}
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
        <TextInput
          style={styles.input}
          placeholder="Nomor Telepon"
          value={nomorTelepon}
          onChangeText={setNomorTelepon}
          autoCompleteType="tel"
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCompleteType="email"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Biaya"
          value={biaya}
          onChangeText={handleBiayaChange}
          autoCompleteType="off"
          autoCorrect={false}
          dataDetectorTypes="none"
          spellCheck={false}
          onFocus={() => setIsNamaActive(true)}
          onBlur={() => setIsNamaActive(false)}
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
        <View style={styles.deadlineContainer}>
          <TouchableOpacity style={styles.deadlineButton} onPress={() => setShowDeadlinePicker(true)}>
            <Text style={styles.deadlineButtonText}>Deadline Produksi: {deadlineProduksi.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDeadlinePicker && (
            <DateTimePicker
              value={deadlineProduksi}
              mode="date"
              display="default"
              onChange={handleSetDeadlineProduksi}
            />
          )}
        </View>
        <View style={styles.deadlineContainer}>
          <TouchableOpacity style={styles.deadlineButton} onPress={() => setShowPengirimanPicker(true)}>
            <Text style={styles.deadlineButtonText}>Deadline Pengiriman: {deadlinePengiriman.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showPengirimanPicker && (
            <DateTimePicker
              value={deadlinePengiriman}
              mode="date"
              display="default"
              onChange={handleSetDeadlinePengiriman}
            />
          )}
        </View>
        <View style={styles.deadlineContainer}>
          <TouchableOpacity style={styles.deadlineButton} onPress={() => setShowMockupPicker(true)}>
            <Text style={styles.deadlineButtonText}>Deadline Mockup: {deadlineMockup.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showMockupPicker && (
            <DateTimePicker
              value={deadlineMockup}
              mode="date"
              display="default"
              onChange={handleSetDeadlineMockup}
            />
          )}
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
                  <Text style={styles.attachedFileName}>{file.name}</Text>
                  <Text style={styles.attachedFileSize}>{((file.size / 1024) / 1024).toFixed(2)} MB</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                  <Text style={styles.deleteButton}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Tombol Add Stock */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddStock}>
        <Text style={styles.addButtonText}>Add Stock</Text>
      </TouchableOpacity>
      {/* Tombol Cancel */}
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}