import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

export default function UpdateSupplierScreen({ navigation, route }) {
  const { supplierData } = route.params;
  const [nama, setNama] = useState(supplierData.NamaSupplier);
  const [PT, setPT] = useState(supplierData.NamaPT);
  const [alamat, setAlamat] = useState(supplierData.Alamat);
  const [noTelp, setNoTelp] = useState(supplierData.NoTelp);
  const [isPTActive, setIsPTActive] = useState(false);
  const [PTRekomendasi, setPTRekomendasi] = useState([]);
  const [PTList, setPTList] = useState([]);
  const [email, setEmail] = useState(supplierData.Email);
  const [note, setNote] = useState(supplierData.Note);

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

  const fetchPT = async () => {
    try {
      const PTSnapshot = await getDocs(collection(db, 'Supplier'));
      const PTSet = new Set();
      PTSnapshot.forEach((doc) => {
        const data = doc.data();
        const namaPT = data?.NamaPT;
        if (namaPT) {
          PTSet.add(namaPT);
        }
      });
      const PTArray = Array.from(PTSet).sort();
      setPTList(PTArray);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };    
  
  useEffect(() => {
    fetchPT();
  }, []);

  const handleUpdateSupplier = async () => {
    const user = auth.currentUser;
    const supplierRef = doc(db, 'Supplier', supplierData.id);
    const logDataRef = collection(db, 'Log Data');
  
    const updatedData = {
      NamaSupplier: nama,
      NamaPT: PT,
      NoTelp: noTelp,
      Alamat: alamat,
      Email: email,
      Note: note,
    };
  
    try {
      await updateDoc(supplierRef, updatedData);
      console.log('Data berhasil diperbarui di Firestore dengan ID:', supplierRef.id);
  
      const logEntry = {
        timestamp: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        action: 'Supplier Updated',
        userID: user.uid,
        refID: supplierRef.id,
      };
  
      await addDoc(logDataRef, logEntry);
      console.log('Log entry added successfully.');
    } catch (error) {
      console.log('Terjadi kesalahan saat memperbarui data di Firestore:', error);
    }
  
    navigation.navigate('Home');
  };

  const handleDeleteSupplier = async () => {
    const supplierRef = doc(db, 'Supplier', supplierData.id);
    const logDataRef = collection(db, 'Log Data');
  
    try {
      await deleteDoc(supplierRef);
      console.log('Supplier document successfully deleted from Firestore.');
  
      const logEntry = {
        timestamp: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        action: 'Supplier Deleted',
        userID: auth.currentUser.uid,
        refID: supplierData.id,
      };
  
      await addDoc(logDataRef, logEntry);
      console.log('Log entry added successfully.');
    } catch (error) {
      console.log('Error deleting supplier document:', error);
    }
  
    navigation.navigate('Home');
  };
  
  const handleCancel = () => {
    setNama('');
    setPT('');
    setNoTelp('');
    setAlamat('');
    setEmail('');
    setNote('');
    
    navigation.navigate('Home');
  };
  
  const handlePTChange = (text) => {
    setPT(text);
    let filteredPT = PTList.filter((item) =>
      item.toLowerCase().includes(text.toLowerCase())
    );
    if (text === '') {
      filteredPT = [];
    }
    setPTRekomendasi(filteredPT);
  };

  const renderPTRekomendasi = ({ item }) => (
    <TouchableOpacity onPress={() => setPT(item)}>
      <Text style={styles.rekomendasiText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Nama Supplier"
          value={nama}
          onChangeText={setNama}
        />
        <TextInput
          style={styles.input}
          placeholder="Nama PT Supplier"
          value={PT}
          onChangeText={handlePTChange}
          autoCompleteType="off"
          autoCorrect={false}
          dataDetectorTypes="none"
          spellCheck={false}
          onFocus={() => setIsPTActive(true)}
          onBlur={() => setIsPTActive(false)}
        />
        {isPTActive && PTRekomendasi.length > 0 && (
          <FlatList
            data={PTRekomendasi}
            renderItem={renderPTRekomendasi}
            keyExtractor={(item) => item}
            style={styles.rekomendasiContainer}
            keyboardShouldPersistTaps="always"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="No. Telp"
          value={noTelp}
          onChangeText={setNoTelp}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.additionalInfoInput}
          placeholder="Alamat"
          value={alamat}
          onChangeText={setAlamat}
          multiline={true}
        />
        <TextInput
          style={styles.additionalInfoInput}
          placeholder="Note"
          value={note}
          onChangeText={setNote}
          multiline={true}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateSupplier}>
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSupplier}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}