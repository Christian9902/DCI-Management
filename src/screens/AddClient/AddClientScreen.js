import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import styles from './Styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export default function AddClientScreen(props) {
  const [nama, setNama] = useState('');
  const [PT, setPT] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noTelp, setNoTelp] = useState('');
  const [Email, setEmail] = useState('');
  const [isPTActive, setIsPTActive] = useState(false);
  const [PTRekomendasi, setPTRekomendasi] = useState([]);
  const [PTList, setPTList] = useState([]);
  const [byOptions, setByOptions] = useState(['Email', 'Whatsapp', 'Instagram', 'Telegram', 'Tik Tok', 'Other']);
  const [selectedByOption, setSelectedByOption] = useState('');
  const [progressOptions, setProgressOptions] = useState(['Contacting', 'Compro Sent', 'Appointment', 'Schedule']);
  const [selectedProgressOption, setSelectedProgressOption] = useState('');
  const [quoSubmitted, setQuoSubmitted] = useState(false);
  const [note, setNote] = useState('');
  const [jobPosition, setJobPosition] = useState('');

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

  const handleAddClient = async () => {
    const user = auth.currentUser;
    const clientRef = collection(db, 'Client');
    const logDataRef = collection(db, 'Log Data');
    const time = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const Query = await getDocs(
      query(clientRef, where('NamaClient', '==', nama), where('NamaPT', '==', PT))
    );
    if (!Query.empty) {
      console.log('Nama Client dengan PT yang sama sudah ada dalam database');
      handleCancel();
      return;
    }

    const data = {
      NamaClient: nama,
      NamaPT: PT,
      NoTelp: noTelp,
      Email: Email,
      Alamat: alamat,
      By: selectedByOption,
      Progress: selectedProgressOption,
      QuoSubmitted: quoSubmitted,
      Note: note,
      JobPosition: jobPosition,
      PIC: user.uid,
      Added: time,
    };

    try {
      const docRef = await addDoc(clientRef, data);
      console.log('Data berhasil disimpan di Firestore dengan ID:', docRef.id);

      const logEntry = {
        timestamp: time,
        action: 'New Client Added',
        userID: user.uid,
        refID: docRef.id,
      };

      await addDoc(logDataRef, logEntry);
      console.log('Log entry added successfully.');
    } catch (error) {
      console.log('Terjadi kesalahan saat menyimpan data ke Firestore:', error);
    }

    setNama('');
    setPT('');
    setNoTelp('');
    setEmail('');
    setAlamat('');
    setSelectedByOption('');
    setSelectedProgressOption('');
    setQuoSubmitted(false);
    setNote('');
    setJobPosition('');

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
    setJobPosition('');

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
          placeholder="Jabatan"
          value={jobPosition}
          onChangeText={setJobPosition}
        />
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
        <TouchableOpacity style={styles.addButton} onPress={handleAddClient}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}