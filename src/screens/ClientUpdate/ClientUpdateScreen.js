import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import styles from './Styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

export default function ClientUpdateScreen({ navigation, route }) {
  const { clientData } = route.params;
  const [nama, setNama] = useState(clientData.NamaClient);
  const [PT, setPT] = useState(clientData.NamaPT);
  const [alamat, setAlamat] = useState(clientData.Alamat);
  const [noTelp, setNoTelp] = useState(clientData.NoTelp);
  const [Email, setEmail] = useState(clientData.Email);
  const [isPTActive, setIsPTActive] = useState(false);
  const [PTRekomendasi, setPTRekomendasi] = useState([]);
  const [PTList, setPTList] = useState([]);
  const [byOptions, setByOptions] = useState(['Email', 'Whatsapp', 'Instagram', 'Telegram', 'Tik Tok','Other']);
  const [selectedByOption, setSelectedByOption] = useState(clientData.By);
  const [progressOptions, setProgressOptions] = useState(['Contacting', 'Compro Sent', 'Appointment', 'Schedule']);
  const [selectedProgressOption, setSelectedProgressOption] = useState(clientData.Progress);
  const [quoSubmitted, setQuoSubmitted] = useState(clientData.Quo);
  const [note, setNote] = useState(clientData.Note);

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
      const PTSnapshot = await getDocs(collection(db, 'Client'));
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

  const handleUpdateClient = async () => {
    const user = auth.currentUser;
    const clientRef = doc(db, 'Client', clientData.Ref);
    const logDataRef = collection(db, 'Log Data');
  
    const updatedData = {
      NamaClient: nama,
      NamaPT: PT,
      NoTelp: noTelp,
      Email: Email,
      Alamat: alamat,
      By: selectedByOption,
      Progress: selectedProgressOption,
      QuoSubmitted: quoSubmitted,
      Note: note,
      PIC: user.uid,
    };
  
    try {
      await updateDoc(clientRef, updatedData);
      console.log('Data berhasil diperbarui di Firestore dengan ID:', clientRef.id);
  
      const logEntry = {
        timestamp: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        action: 'Client Updated',
        userID: user.uid,
        refID: clientRef.id,
      };
  
      await addDoc(logDataRef, logEntry);
      console.log('Log entry added successfully.');
    } catch (error) {
      console.log('Terjadi kesalahan saat memperbarui data di Firestore:', error);
    }
  
    navigation.navigate('Home');
  };
  
  const handleDeleteClient = async () => {
    const clientRef = doc(db, 'Client', clientData.Ref);
    const logDataRef = collection(db, 'Log Data');

    try {
      await deleteDoc(clientRef);
      console.log('Client document successfully deleted from Firestore.');

      const logEntry = {
        timestamp: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        action: 'Client Deleted',
        userID: auth.currentUser.uid,
        refID: clientData.Ref,
      };

      await addDoc(logDataRef, logEntry);
      console.log('Log entry added successfully.');
    } catch (error) {
      console.log('Error deleting client document:', error);
    }

    navigation.navigate('Home');
  };

  const handleCancel = () => {
    setNama('');
    setPT('');
    setNoTelp('');
    setEmail('');
    setAlamat('');
    setSelectedByOption('');
    setSelectedProgressOption('');
    setQuoSubmitted(false);
    setNote('');
    
    navigation.navigate('Clients');
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
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nama Client"
          value={nama}
          onChangeText={setNama}
        />
        <TextInput
          style={styles.input}
          placeholder="Nama PT Client"
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
          value={Email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.additionalInfoInput}
          placeholder="Alamat"
          value={alamat}
          onChangeText={setAlamat}
          multiline={true}
        />
        <Text style={styles.label}>By:</Text>
        <FlatList
          data={byOptions}
          horizontal={true}
          contentContainerStyle={styles.optionContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.option, selectedByOption === item && styles.selectedOption]}
              onPress={() => setSelectedByOption(item)}
            >
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
        <Text style={styles.label}>Progress:</Text>
        <FlatList
          data={progressOptions}
          horizontal={true}
          contentContainerStyle={styles.optionContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.option, selectedProgressOption === item && styles.selectedOption]}
              onPress={() => setSelectedProgressOption(item)}
            >
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => {
            setQuoSubmitted(!quoSubmitted);
          }}
        >
          <Text style={styles.label}>Quo Submitted:</Text>
          <Text style={styles.checkboxIcon}>{quoSubmitted ? '✓' : ''}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.additionalInfoInput}
          placeholder="Note"
          value={note}
          onChangeText={setNote}
          multiline={true}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleUpdateClient}>
          <Text style={styles.addButtonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteClient}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}