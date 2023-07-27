import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, ScrollView, Modal, ToastAndroid } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth, storage } from '../Login/LoginScreen';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function AddOrderScreen(props) {
  // ... (state dan fungsi yang sudah ada sebelumnya)

  // ...

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [clientList, setClientList] = useState([]); // Daftar client dari Firebase
  const [supplierList, setSupplierList] = useState([]);
  const [sortedSupplierArray, setSortedSupplierArray] = useState([]);

  const handleCreate = async () => {
    // ... (fungsi handleCreate yang sudah ada sebelumnya)

    try {
      const data = {
        // ... (bagian lain dari data yang sudah ada sebelumnya)
        Attachment: attachment.map(file => file.name),
        PIC: user.uid,
        Timestamp: time,
      };

      const orderRef = await addDoc(collection(db, 'Order'), data);
      const storageRef = ref(storage, `Order/${orderRef.id}`);
      setShowProgressModal(true);
      await uploadFiles(storageRef);
      setShowProgressModal(false);

      // ... (bagian lain dari handleCreate yang sudah ada sebelumnya)

      setNamaProject('');
      setNamaClient('');
      setPTClient('');
      setNoTelpClient('');
      setEmailClient('');
      setSuppliers([]);
      setDetails('');
      setHarga('');
      setTimeline([new Date(), new Date(), new Date()]);
      setProgress([false, false, false]);
      setAttachment([]);

      navigation.navigate('Home');
      ToastAndroid.show('Order created successfully!', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  useEffect(() => {
    console.log('useEffect is running...');
    fetchClient();
    fetchSupplier();
  }, []);

  const fetchClient = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'clients'));
      const clientsData = querySnapshot.docs.map((doc) => doc.data());
      console.log('Clients Data:', clientsData); // Add this line to check the data
      setClientList(clientsData);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };
  
  const fetchSupplier = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'suppliers'));
      const suppliersData = querySnapshot.docs.map((doc) => doc.data());
      console.log('Suppliers Data:', suppliersData); // Add this line to check the data
      // ... (rest of the code)
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };
  
  
  

  const handleCancel = () => {
    // ... (fungsi handleCancel yang sudah ada sebelumnya)

    setNamaProject('');
    setNamaClient('');
    setPTClient('');
    setNoTelpClient('');
    setEmailClient('');
    setSuppliers([]);
    setDetails('');
    setHarga('');
    setTimeline([new Date(), new Date(), new Date()]);
    setProgress([false, false, false]);
    setAttachment([]);

    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
  
        {/* ... (Input fields for order details) */}
        
        {/* ... (Contact Person and Vendor Selection UI) */}

        {/* ... (Deadline and Spesifikasi input fields) */}
        
        {/* ... (Attached Files UI) */}
        <Text>List of Clients:</Text>
        <FlatList
          data={clientList}
          keyExtractor={(item) => item.id} // Assuming each client object has an 'id' field
          renderItem={({ item }) => (
            <Text>{item.clientName}</Text> // Replace 'clientName' with the actual field name for the client name
          )}
        />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for showing upload progress */}
      {showProgressModal && (
        <Modal visible={showProgressModal} transparent={true}>
          <View style={styles.progressModalContainer}>
            <View style={styles.progressModalContent}>
              <Text style={styles.progressModalText}>Uploading...</Text>
              {uploadProgress.map((fileProgress, index) => (
                <View key={index}>
                  <Text>{`${fileProgress.name}: ${fileProgress.progress.toFixed(2)}%`}</Text>
                  {console.log(fileProgress.name, fileProgress.progress.toFixed(2))}
                </View>
              ))}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
