import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ToastAndroid } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth } from '../Login/LoginScreen';
import { doc, updateDoc, collection, getDoc, addDoc, getDocs } from 'firebase/firestore';
import { Web } from "react-native-openanything";

export default function OrderDetailScreen({ navigation, route }) {
  const { orderData } = route.params;
  const [progress, setProgress] = useState(orderData.progress);
  const [isDone, setIsDone] = useState(orderData.isDone);
  const [materialDetails, setMaterialDetails] = useState([]);
  const [pass, setPass] = useState([]);

  const isInitialRender = useRef(true);

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
        <TouchableOpacity onPress={() => (pass[2] !== 'Production' ? navigation.navigate("Order Update", { orderData: orderData }) : ToastAndroid.show('Not Permitted', ToastAndroid.SHORT))}>
          <Image
            style={styles.headerIcon}
            source={require('../../../assets/icons/edit.png')}
          />
        </TouchableOpacity>
      ),
    });
  }, [pass]);

  useEffect(() => {
    checkUserPass();
  }, []);

  const checkUserPass = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPass([user.uid, userData.Nama, userData.Status]);
        }
      } catch (error) {
        console.trace(error);
      }
    }
  };

  useEffect(() => {
    const allProgressDone = progress.every((item) => item === true);
    setIsDone(allProgressDone);
  }, [pass, progress]);

  useEffect(() => {
    if (isInitialRender.current) {
      fetchMaterialDetails();
      isInitialRender.current = false;
    }
  }, [pass, orderData.materials]);

  const fetchMaterialDetails = async () => {
    try {
      const materialDetailsArray = [];
      for (const material of orderData.materials) {
        const materialDocRef = doc(db, 'Inventory', material.stockID);
        const materialDocSnap = await getDoc(materialDocRef);
        if (materialDocSnap.exists()) {
          const materialData = materialDocSnap.data();
          const materialDetail = {
            NamaBarang: materialData.NamaBarang,
            NamaSupplier: materialData.NamaSupplier,
            amount: material.amount,
            stockID: material.stockID,
          };
          materialDetailsArray.push(materialDetail);
        }
      }

      materialDetailsArray.sort((a, b) => {
        const productNameA = a.NamaBarang.toLowerCase();
        const productNameB = b.NamaBarang.toLowerCase();
        const supplierNameA = a.NamaSupplier.split('- ')[1]?.toLowerCase();
        const supplierNameB = b.NamaSupplier.split('- ')[1]?.toLowerCase();

        if (productNameA < productNameB) return -1;
        if (productNameA > productNameB) return 1;
        if (supplierNameA < supplierNameB) return -1;
        if (supplierNameA > supplierNameB) return 1;
        return 0;
      });

      const sortedMaterials = orderData.materials.slice().sort((a, b) => {
        const materialA = materialDetailsArray.find((m) => m.stockID === a.stockID);
        const materialB = materialDetailsArray.find((m) => m.stockID === b.stockID);
        return materialDetailsArray.indexOf(materialA) - materialDetailsArray.indexOf(materialB);
      });
  
      setMaterialDetails(materialDetailsArray);
      orderData.materials = sortedMaterials;
    } catch (error) {
      console.log('Failed to fetch material details:', error);
    }
  };

  const handleReturnButtonPress = async () => {
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
      await updateDoc(orderRef, { Progress: progress, isDone: isDone, Materials: orderData.materials, isDoneTime: (isDone ? time : '') });

      const clientSnapshot = await getDocs(collection(db, 'Client'));
      let clientID;
      let clientHistory;
      clientSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data?.NamaClient === orderData.namaClient && data?.NamaPT === orderData.ptClient) {
          clientID = doc.id;
          clientHistory = data?.History || [];
        }
      });
  
      if (clientID) {
        if (isDone) {
          const clientRef = doc(db, 'Client', clientID);
          await updateDoc(clientRef, { History: Array.isArray(clientHistory) ? [...clientHistory, orderRef.id] : [orderRef.id] });
        } else {
          if (clientHistory.includes(orderData.orderID)) {
            const clientRef = doc(db, 'Client', clientID);
            await updateDoc(clientRef, { History: clientHistory.filter((orderId) => orderId !== orderData.orderID) });
          }
        }
      }
      
      const logEntry = {
        timestamp: time,
        action: isDone ? `${orderData.orderID}'s Order Finished` : `${orderData.orderID}'s Progress updated`,
        userID: user.uid,
        refID: orderData.orderID,
      };
      await addDoc(logDataRef, logEntry);
      
      ToastAndroid.show('Progress updated!', ToastAndroid.SHORT);
      navigation.navigate('Home');
    } catch (error) {
      ToastAndroid.show(`Failed to update progress! ${error}`, ToastAndroid.SHORT);
    }
  };

  const handleProgressButtonPress = (index) => {
    if (pass[2] !== 'Marketing') {
      const updatedProgress = [...progress];
      updatedProgress[index] = !updatedProgress[index];
      setProgress(updatedProgress);
    } else {
      ToastAndroid.show('Not Permitted', ToastAndroid.SHORT);
    }
  };

  const handleDeleteMaterial = async (material) => {
    const user = auth.currentUser;
    try {
      const updatedMaterials = orderData.materials.filter(
        (item) => item.stockID !== material.stockID
      );
      const orderRef = doc(db, 'Order', orderData.orderID);
      await updateDoc(orderRef, { Materials: updatedMaterials });
      orderData.materials = updatedMaterials;
  
      const inventoryDocRef = doc(db, 'Inventory', material.stockID);
      const inventoryDocSnap = await getDoc(inventoryDocRef);
      if (inventoryDocSnap.exists()) {
        const inventoryData = inventoryDocSnap.data();
        const returnedAmount = material.amount;
        const newAmount = (inventoryData.Jumlah || 0) + returnedAmount;
        await updateDoc(inventoryDocRef, { Jumlah: newAmount });
  
        const logData = {
          timestamp: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          refID: orderData.orderID,
          userID: user.uid,
          action: `Returned ${material.NamaBarang} (${material.NamaSupplier}) - x${returnedAmount} from order ${orderData.orderID}`,
        };
        await addDoc(collection(db, 'Log Data'), logData);
      }
  
      setMaterialDetails((prevMaterials) =>
        prevMaterials.filter((item) => item.stockID !== material.stockID)
      );

      fetchMaterialDetails();
      ToastAndroid.show('Material removed and returned to inventory!', ToastAndroid.SHORT);
    } catch (error) {
      console.log('Failed to remove material:', error);
      ToastAndroid.show('Failed to remove material!', ToastAndroid.SHORT);
    }
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
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Materials:</Text>
          {materialDetails.map((material, index) => (
            <View key={index} style={styles.attachedFileItem}>
              <Text style={styles.infoText}>{material.NamaBarang} ({material.NamaSupplier}) x{material.amount}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteMaterial(material)}
              >
                <Text style={styles.deleteButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      {pass[2] !== 'Marketing' ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.createButton} onPress={() => {
            navigation.navigate('Take', {
              orderData: orderData,
              isRecordingForOrder: true,
            })
            isInitialRender.current = true;
          }}>
            <Text style={styles.createButtonText}>Take Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.returnButton} onPress={handleReturnButtonPress}>
            <Text style={styles.returnButtonText}>{isDone ? 'Finish' : 'Return'}</Text>
          </TouchableOpacity>
        </View>
      ) : <View /> }
    </View>
  );
}