import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, ScrollView, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth } from '../Login/LoginScreen';
import { addDoc, collection, getDocs } from 'firebase/firestore';

export default function AddOrderScreen(props) {
  const [namaProject, setNamaProject] = useState('');
  const [namaClient, setNamaClient] = useState('');
  const [PTClient, setPTClient] = useState('');
  const [noTelpClient, setNoTelpClient] = useState('');
  const [emailClient, setEmailClient] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [details, setDetails] = useState('');
  const [harga, setHarga] = useState('');
  const [timeline, setTimeline] = useState([new Date, new Date, new Date]);
  const [progress, setProgress] = useState([false, false, false]);
  const [PIC, setPIC] = useState('');
  const [attachment, setAttachment] = useState([]);
  
  const [clientRekomendasi, setClientRekomendasi] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  
  const [isClientActive, setIsClientActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showPengirimanPicker, setShowPengirimanPicker] = useState(false);
  const [showMockupPicker, setShowMockupPicker] = useState(false);

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
      setClientRekomendasi(clientArray);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };

  const handleClientChange = (text) => {
    setNamaClient(text);
    let filteredClient = [];
    if (text === '') {
      filteredClient = clientList;
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

  const renderClientRekomendasi = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => setNamaClient(item)}>
        <Text>{item}</Text>
      </TouchableOpacity>
    );
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
  
    const sortedUnselectedVendors = sortSupplierArray(unselectedVendors);
  
    const sortedSupplierList = [...selectedVendors, ...sortedUnselectedVendors];
  
    setSupplierList(sortedSupplierList);
    setSuppliers(selectedVendors);
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
  
  const handleRemoveSupplier = (index) => {
    const updatedSuppliers = [...suppliers];
    updatedSuppliers.splice(index, 1);
    setSuppliers(updatedSuppliers);
    
    const updatedSupplierList = supplierList.map((item) => ({
      ...item,
      selected: updatedSuppliers.some((selectedItem) => selectedItem.ref === item.ref),
    }));
    setSupplierList(updatedSupplierList);
  };
  

  const handleDeadline = (event, selectedDate) => {
    if (selectedDate !== undefined) {
      if (showMockupPicker) {
        setTimeline([selectedDate, timeline[1], timeline[2]]);
      } else if (showDeadlinePicker) {
        setTimeline([timeline[0], selectedDate, timeline[2]]);
      } else if (showPengirimanPicker) {
        setTimeline([timeline[0], timeline[1], selectedDate]);
      }
    }
  
    setShowMockupPicker(false);
    setShowDeadlinePicker(false);
    setShowPengirimanPicker(false);
  };
  
  const handleAttachment = async () => {
    try {
      const response = await DocumentPicker.getDocumentAsync();
      if (response.type === 'success') {
        const { name, size, uri } = response;
        const file = { name, size, uri };
        setAttachment([...attachment, file]);
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...attachment];
    updatedFiles.splice(index, 1);
    setAttachment(updatedFiles);
  };

  const handleCreate = () => {
  };

  const handleCancel = () => {
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
    setPIC('');
    setAttachment([]);

    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
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
          <FlatList
            data={clientRekomendasi}
            renderItem={renderClientRekomendasi}
            keyExtractor={(item) => item}
            style={styles.rekomendasiContainer}
            keyboardShouldPersistTaps="always"
          />
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
                <TouchableOpacity onPress={() => handleRemoveSupplier(index)}>
                  <Text style={styles.deleteButton}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.listButton}
          onPress={() => {
            setModalVisible(true)
            console.log(suppliers)
        }}>
          <Text style={styles.listTitle}>Select Vendor</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
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
                <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                  <Text style={styles.deleteButton}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}