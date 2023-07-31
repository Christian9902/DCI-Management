import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, ScrollView, Modal, ToastAndroid } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth, storage } from '../Login/LoginScreen';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { Web } from "react-native-openanything";

export default function OrderUpdateScreen({ navigation, route }) {
  const { orderData } = route.params;
  const [namaProject, setNamaProject] = useState(orderData.project);
  const [namaClient, setNamaClient] = useState(orderData.namaClient);
  const [PTClient, setPTClient] = useState(orderData.ptClient);
  const [noTelpClient, setNoTelpClient] = useState(orderData.notelpClient);
  const [emailClient, setEmailClient] = useState(orderData.emailClient);
  const [suppliers, setSuppliers] = useState(orderData.supplier);
  const [details, setDetails] = useState(orderData.spesifikasi);
  const [harga, setHarga] = useState(orderData.harga);
  const [timeline, setTimeline] = useState(orderData.deadline.map(timestamp => timestamp.toDate()));
  const [progress, setProgress] = useState(orderData.progress);
  const [attachment, setAttachment] = useState(orderData.attachment);
  const [clientRekomendasi, setClientRekomendasi] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  
  const [isClientActive, setIsClientActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showPengirimanPicker, setShowPengirimanPicker] = useState(false);
  const [showMockupPicker, setShowMockupPicker] = useState(false);

  const [uploadProgress, setUploadProgress] = useState([]);
  const [showProgressModal, setShowProgressModal] = useState(false);

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

  useEffect(() => {
    fetchClient();
    fetchSupplier();
  }, []);

  const fetchClient = async () => {
    try {
      const clientSnapshot = await getDocs(collection(db, 'Client'));

      const clientArray = [];
      clientSnapshot.forEach((doc) => {
        const data = doc.data();
        const Ref = doc.id;
        const NamaClient = data?.NamaClient;
        const NamaPT = data?.NamaPT;
        const Alamat = data?.Alamat;
        const Email = data?.Email;
        const NoTelp = data?.NoTelp;
        const Job = data?.JobPosition;

        if (NamaClient) {
          clientArray.push({
            Ref,
            NamaClient,
            NamaPT,
            Alamat,
            Email,
            NoTelp,
            Job,
          });
        }
      });

      clientArray.sort((a, b) => {
        const clientNameA = a.NamaClient.toLowerCase();
        const clientNameB = b.NamaClient.toLowerCase();
        const clientPTNameA = a.NamaPT.split('- ')[1]?.toLowerCase();
        const clientPTNameB = b.NamaPT.split('- ')[1]?.toLowerCase();

        if (clientNameA < clientNameB) return -1;
        if (clientNameA > clientNameB) return 1;
        if (clientPTNameA < clientPTNameB) return -1;
        if (clientPTNameA > clientPTNameB) return 1;
        return 0;
      });

      setClientList(clientArray);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };

  const handleClientChange = (text) => {
    setNamaClient(text);
    let filteredClient = [];
    if (text.length === 0) {
      filteredClient = [];
    } else {
      filteredClient = clientList.filter((item) => {
        const namaClient = item.NamaClient.toLowerCase();
        const namaPT = item.NamaPT.toLowerCase();
        const filterText = text.toLowerCase().trim();
  
        return namaClient.includes(filterText) || namaPT.includes(filterText);
      });
    }
    setClientRekomendasi(filteredClient);
  };

  const handleSelectClient = (selectedClient) => {
    setNamaClient(selectedClient.NamaClient);
    setPTClient(selectedClient.NamaPT);
    setNoTelpClient(selectedClient.NoTelp);
    setEmailClient(selectedClient.Email);
  };

  const fetchSupplier = async () => {
    try {
      const supplierSnapshot = await getDocs(collection(db, 'Supplier'));
      const supplierArray = [];
      supplierSnapshot.forEach((doc) => {
        const data = doc.data();
        const ref = doc.id;
        const namaSupplier = data?.NamaSupplier;
        const PTSupplier = data?.NamaPT;
  
        supplierArray.push({
          ref,
          namaSupplier,
          PTSupplier,
          selected: false,
        });
      });
  
      const sortedSupplierArray = sortSupplierArray(supplierArray);
      setSupplierList(sortedSupplierArray);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };  

  const handleSelectVendor = (selectedItem) => {
    const updatedSupplierList = supplierList.map((item) => ({
      ...item,
      selected: item.ref === selectedItem.ref ? !item.selected : item.selected,
    }));
  
    const selectedVendors = updatedSupplierList.filter((item) => item.selected);
    const unselectedVendors = updatedSupplierList.filter((item) => !item.selected);
  
    const sortedSelectedVendors = sortSupplierArray(selectedVendors);
    const sortedUnselectedVendors = sortSupplierArray(unselectedVendors);
  
    const sortedSupplierList = [...sortedSelectedVendors, ...sortedUnselectedVendors];
  
    setSupplierList(sortedSupplierList);
    setSuppliers(sortedSelectedVendors);
  };  

  const sortSupplierArray = (supplierArray) => {
    supplierArray.sort((a, b) => {
      const supplierPTNameA = a.PTSupplier.toLowerCase();
      const supplierPTNameB = b.PTSupplier.toLowerCase();
      const supplierNameA = a.namaSupplier.toLowerCase();
      const supplierNameB = b.namaSupplier.toLowerCase();
  
      if (supplierPTNameA < supplierPTNameB) return -1;
      if (supplierPTNameA > supplierPTNameB) return 1;
      if (supplierNameA < supplierNameB) return -1;
      if (supplierNameA > supplierNameB) return 1;
      return 0;
    });
    return supplierArray;
  };

  const handleDeadline = (event, selectedDate) => {
    setShowMockupPicker(false);
    setShowDeadlinePicker(false);
    setShowPengirimanPicker(false);

    if (selectedDate !== undefined) {
      if (showMockupPicker) {
        setTimeline([selectedDate, timeline[1], timeline[2]]);
      } else if (showDeadlinePicker) {
        setTimeline([timeline[0], selectedDate, timeline[2]]);
      } else if (showPengirimanPicker) {
        setTimeline([timeline[0], timeline[1], selectedDate]);
      }
    }
  };
  
  const handleAttachment = async () => {
    try {
      const response = await DocumentPicker.getDocumentAsync();
      if (response.type === 'success') {
        const { name, size, uri, mimeType } = response;
  
        const fileResponse = await fetch(uri);
        const fileBlob = await fileResponse.blob();
  
        const file = { name, size, uri, mimeType, fileBlob };
        setAttachment((prevAttachments) => [...prevAttachments, file]);
      }
    } catch (error) {
      console.log('Error picking document:', error);
      ToastAndroid.show('Error picking document.', ToastAndroid.SHORT);
    }
  };  

  const handleRemoveFile = (index) => {
    const updatedFiles = [...attachment];
    updatedFiles.splice(index, 1);
    setAttachment(updatedFiles);
  };

  const uploadFile = async (file, storageRef) => {
    try {
      const fileRef = ref(storageRef, file.name);
      const uploadTask = uploadBytesResumable(fileRef, file.fileBlob);
  
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress((prevProgress) => [
              ...prevProgress.filter((item) => item.name !== file.name),
              { name: file.name, progress },
            ]);
          },
          (error) => {
            console.log('Error uploading file:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              console.log('Error getting download URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.log(`Error uploading file:`, error);
      throw error;
    }
  }; 

  const handleUpdate = async () => {
    const filesToRemove = [];

    for (const existingFile of orderData.attachment) {
      if (!attachment.some(newFile => newFile.name === existingFile.name)) {
        filesToRemove.push(existingFile.name);
      }
    }

    const user = auth.currentUser;
    const orderRef = doc(db, 'Order', orderData.orderID);
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
      const storageRef = ref(storage, `Order/${orderData.orderID}`);
      for (const fileName of filesToRemove) {
        try {
          await deleteObject(ref(storageRef, fileName));
          console.log(`File ${fileName} successfully removed from Firebase storage.`);
        } catch (error) {
          console.error(`Error removing file ${fileName} from Firebase storage:`, error);
        }
      }

      const newFiles = attachment.filter(newFile => !orderData.attachment.some(existingFile => existingFile.name === newFile.name));
      const existingFiles = attachment.filter(newFile => orderData.attachment.some(existingFile => existingFile.name === newFile.name));
      setShowProgressModal(true);
      const downloadURLs = await Promise.all(
        newFiles.map((file) => uploadFile(file, storageRef))
      );
      setShowProgressModal(false);

      const updatedAttachment = [
        ...existingFiles,
        ...newFiles.map((file, index) => ({
          name: file.name,
          size: file.size,
          type: file.mimeType,
          downloadURL: downloadURLs[index],
        })),
      ];

      await updateDoc(orderRef, {
        NamaProject: namaProject,
        NamaClient: namaClient,
        PTClient: PTClient,
        NoTelpClient: noTelpClient,
        EmailClient: emailClient,
        Supplier: suppliers,
        Spesifikasi: details,
        Harga: harga,
        Deadline : timeline,
        Attachment: updatedAttachment,
      });

      const logEntry = {
        timestamp: time,
        action: 'Order Updated',
        userID: user.uid,
        refID: orderData.orderID,
      };
      await addDoc(logDataRef, logEntry);

      navigation.navigate('Home');
      ToastAndroid.show('Order updated successfully!', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDelete = async () => {
    const user = auth.currentUser;
    const orderRef = doc(db, 'Order', orderData.orderID);
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
      await deleteDoc(orderRef);
  
      if (attachment !== []) {
        const storageRef = ref(storage, `Order/${orderData.orderID}`);
        listAll(storageRef)
          .then((result) => {
            const promises = result.items.map((itemRef) => deleteObject(itemRef));
            return Promise.all(promises);
          })
          .catch((error) => {
            console.error('Error deleting folder:', error);
          });
      }
  
      const logEntry = {
        timestamp: time,
        action: 'Order Deleted',
        userID: user.uid,
        refID: orderData.orderID,
      };
      await addDoc(logDataRef, logEntry);
  
      navigation.navigate('Home');
      ToastAndroid.show('Order deleted successfully!', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return ( 
    <View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.input}
          placeholder="Nama Project"
          value={namaProject}
          onChangeText={setNamaProject}
        />
        <Text style={styles.attachedFilesTitle}>Contact Person:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama Client"
          value={namaClient}
          onChangeText={handleClientChange}
          autoCompleteType="off"
          autoCorrect={false}
          dataDetectorTypes="none"
          spellCheck={false}
          onFocus={() => setIsClientActive(true)}
          onBlur={() => setIsClientActive(false)}
        />
        {isClientActive && clientRekomendasi.length > 0 && (
          <View style={styles.attachedFilesContainer}>
            {clientRekomendasi.map((client, index) => (
              <View key={index} style={styles.attachedFileItem}>
                <TouchableOpacity onPress={() => handleSelectClient(client)}>
                  <Text style={styles.attachedFileName}>{client.NamaClient}</Text>
                  <Text style={styles.attachedFileSize}>{client.NamaPT}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="PT Client"
          value={PTClient}
          onChangeText={setPTClient}
        />
        <TextInput
          style={styles.input}
          placeholder="No. Telp Client"
          value={noTelpClient}
          onChangeText={setNoTelpClient}
          autoCompleteType="tel"
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Email Client"
          value={emailClient}
          onChangeText={setEmailClient}
        />

        {suppliers.length > 0 && (
          <View style={styles.attachedFilesContainer}>
            <Text style={styles.attachedFilesTitle}>Vendor Selected:</Text>
            {suppliers.map((supplier, index) => (
              <View key={index} style={styles.attachedFileItem}>
                <View>
                  <Text style={styles.attachedFileName}>{supplier.namaSupplier}</Text>
                  <Text style={styles.attachedFileSize}>{supplier.PTSupplier}</Text>
                </View>
                <TouchableOpacity onPress={() => handleSelectVendor(supplier)}>
                  <Text style={styles.deleteButton}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.listButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.listTitle}>Select Vendor</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <FlatList
                data={supplierList}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectVendor(item)}>
                    <View
                      style={[
                        styles.supplierText,
                        item.selected && styles.supplierTextActive,
                      ]}
                    >
                      <Text style={styles.supplierName}>{item.namaSupplier}</Text>
                      <Text style={styles.separator}>-</Text>
                      <Text style={styles.supplierPT}>{item.PTSupplier}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.ref}
                style={styles.rekomendasiContainer}
                keyboardShouldPersistTaps="always"
              />
              <View style={styles.buttonContainerModal}>
                <TouchableOpacity
                  style={styles.saveButtonModal}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.saveButtonTextModal}>SAVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TextInput
          style={styles.input}
          placeholder="Harga"
          value={harga}
          onChangeText={setHarga}
          keyboardType="numeric"
        />
        <Text style={styles.attachedFilesTitle}>Deadline:</Text>
        <View style={styles.deadlineContainer}>
          <TouchableOpacity style={styles.deadlineButton} onPress={() => setShowMockupPicker(true)}>
            <Text style={styles.deadlineButtonText}>Mockup: {timeline[0].toLocaleDateString('en-GB')}</Text>
          </TouchableOpacity>
          {showMockupPicker && (
            <DateTimePicker
              value={timeline[0]}
              mode="date"
              display="default"
              onChange={handleDeadline}
            />
          )}
          <TouchableOpacity style={styles.deadlineButton} onPress={() => setShowDeadlinePicker(true)}>
            <Text style={styles.deadlineButtonText}>Produksi: {timeline[1].toLocaleDateString('en-GB')}</Text>
          </TouchableOpacity>
          {showDeadlinePicker && (
            <DateTimePicker
              value={timeline[1]}
              mode="date"
              display="default"
              onChange={handleDeadline}
            />
          )}
          <TouchableOpacity style={styles.deadlineButton} onPress={() => setShowPengirimanPicker(true)}>
            <Text style={styles.deadlineButtonText}>Pengiriman: {timeline[2].toLocaleDateString('en-GB')}</Text>
          </TouchableOpacity>
          {showPengirimanPicker && (
            <DateTimePicker
              value={timeline[2]}
              mode="date"
              display="default"
              onChange={handleDeadline}
            />
          )}
        </View>
        <TextInput
          style={styles.additionalInfoInput}
          placeholder="Spesifikasi"
          value={details}
          onChangeText={setDetails}
          multiline={true}
        />
        {attachment.length > 0 && (
          <View style={styles.attachedFilesContainer}>
            <Text style={styles.attachedFilesTitle}>Attached Files:</Text>
            {attachment.map((file, index) => (
              <View key={index} style={styles.attachedFileItem}>
                <View>
                  <Text style={styles.attachedFileName}>{file.name}</Text>
                  <Text style={styles.attachedFileSize}>{((file.size / 1024) / 1024).toFixed(2)} MB</Text>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <TouchableOpacity onPress={() => Web(file.downloadURL)}>
                    <Image
                      style={styles.openIcon}
                      source={require('../../../assets/icons/open.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                    <Text style={styles.deleteButton}>X</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={handleUpdate}>
          <Text style={styles.createButtonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton2} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => {navigation.navigate('Home')}}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {showProgressModal && (
        <Modal visible={showProgressModal} transparent={true}>
          <View style={styles.progressModalContainer}>
            <View style={styles.progressModalContent}>
              <Text style={styles.progressModalText}>Uploading...</Text>
              {uploadProgress.map((fileProgress, index) => (
                <View key={index}>
                  <Text>{`${fileProgress.name}: ${fileProgress.progress.toFixed(2)}%`}</Text>
                </View>
              ))}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}