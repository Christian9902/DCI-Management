import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ToastAndroid } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db } from '../Login/LoginScreen';
import { doc, updateDoc } from 'firebase/firestore';
import { Web } from "react-native-openanything";

export default function OrderDetailScreen({ navigation, route }) {
  const { orderData } = route.params;
  const [progress, setProgress] = useState(orderData.progress);
  const [isDone, setIsDone] = useState(orderData.isDone);

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
        <TouchableOpacity onPress={() => (navigation.navigate("Order Update", { orderData: orderData }))}>
        <Image
          style={styles.headerIcon}
          source={require('../../../assets/icons/edit.png')}
        />
      </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    const allProgressDone = progress.every((item) => item === true);
    setIsDone(allProgressDone);
  }, [progress]);

  const handleReturnButtonPress = async () => {
    try {
      const orderRef = doc(db, 'Order', orderData.orderID);
      await updateDoc(orderRef, { Progress: progress, isDone: isDone });
      
      ToastAndroid.show('Progress updated!', ToastAndroid.SHORT);
      navigation.navigate('Home');
    } catch (error) {
      ToastAndroid.show(`Failed to update progress! ${error}`, ToastAndroid.SHORT);
    }
  };

  const handleProgressButtonPress = (index) => {
    const updatedProgress = [...progress];
    updatedProgress[index] = !updatedProgress[index];
    setProgress(updatedProgress);
  };

  return ( 
    <View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Nama Project:</Text>
          <Text style={styles.infoText}>{orderData.project}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Contact Person:</Text>
          <Text style={styles.infoText}>{orderData.namaClient}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>PT Client:</Text>
          <Text style={styles.infoText}>{orderData.ptClient}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>No. Telp Client:</Text>
          <Text style={styles.infoText}>{orderData.notelpClient}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Email Client:</Text>
          <Text style={styles.infoText}>{orderData.emailClient}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Vendor Selected:</Text>
          {orderData.supplier.map((supplier, index) => (
            <View key={index} style={styles.attachedFileItem}>
              <View>
                <Text style={styles.infoText}>{supplier.namaSupplier} - {supplier.PTSupplier}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Deadline:</Text>
          <Text style={styles.infoText}>Mockup: {orderData.deadlineTemp[0].toDate().toLocaleDateString('en-GB')}</Text>
          <Text style={styles.infoText}>Produksi: {orderData.deadlineTemp[1].toDate().toLocaleDateString('en-GB')}</Text>
          <Text style={styles.infoText}>Pengiriman: {orderData.deadlineTemp[2].toDate().toLocaleDateString('en-GB')}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.infoLabel}>Progress:</Text>
          <View style={styles.progressButtonsContainer}>
            <TouchableOpacity
              onPress={() => handleProgressButtonPress(0)}
              style={[
                styles.progressButton,
                { backgroundColor: progress[0] ? 'green' : 'red' },
              ]}
            >
              <Text style={styles.progressButtonText}>Mockup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleProgressButtonPress(1)}
              style={[
                styles.progressButton,
                { backgroundColor: progress[1] ? 'green' : 'red' },
              ]}
            >
              <Text style={styles.progressButtonText}>Produksi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleProgressButtonPress(2)}
              style={[
                styles.progressButton,
                { backgroundColor: progress[2] ? 'green' : 'red' },
              ]}
            >
              <Text style={styles.progressButtonText}>Pengiriman</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Spesifikasi:</Text>
          <Text style={styles.infoText}>{orderData.spesifikasi}</Text>
        </View>
        <View style={styles.attachedFilesContainer}>
          <Text style={styles.attachedFilesTitle}>Attached Files:</Text>
          {orderData.attachment.map((file, index) => (
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
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={() => (navigation.navigate('Take'))}>
          <Text style={styles.createButtonText}>Take Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.returnButton} onPress={handleReturnButtonPress}>
          <Text style={styles.returnButtonText}>{isDone ? 'Finish' : 'Return'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}