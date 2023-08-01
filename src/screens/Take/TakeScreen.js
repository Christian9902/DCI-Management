import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { ToastAndroid, View, Text, TextInput, FlatList, Image, Pressable, TouchableOpacity, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { auth, db } from '../Login/LoginScreen';
import { collection, getDocs, addDoc, writeBatch, doc, increment, getDoc, updateDoc, where, arrayUnion } from 'firebase/firestore';


export default function TakeStockScreen({ navigation, route }) {
  const { isRecordingForOrder, orderData } = route.params;
  const [nama, setNama] = useState('');  
  const [namaBarangRekomendasi, setNamaBarangRekomendasi] = useState([]);
  const [barangData, setBarangData] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [status, setStatus] = useState(null);
  const [barValue, setBarValue] = useState(null);
  const isInitialRender = useRef(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <MenuImage
          onPress={() => {
            navigation.openDrawer();
          }}
        />
      ),
      headerTitle: () => (
        <View style={styles.searchContainer}>
          <Image style={styles.searchIcon} source={require("../../../assets/icons/search.png")} />
          <TextInput
            style={styles.searchInput}
            onChangeText={handleNamaChange}
            value={nama}
            placeholder={"Barang1, Barang2, ...; Supplier1, Supplier2..."}
          />
          <Pressable onPress={() => {setNama(""); handleNamaChange("")}}>
            <Image style={styles.searchIcon} source={require("../../../assets/icons/close.png")} />
          </Pressable>
        </View>
      ),
      headerRight: () => (
        <View>
          <TouchableOpacity onPress={() => setShowFilterModal(true)}>
            <Image style={styles.filterIcon} source={require('../../../assets/icons/filter.png')} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [nama, isRecordingForOrder]);

  const fetchInventory = async () => {
    try {
      const inventorySnapshot = await getDocs(collection(db, 'Inventory'));
      const barangArray = [];
      inventorySnapshot.forEach((doc) => {
        const data = doc.data();
        const ref = doc.id;
        const namaBarang = data?.NamaBarang;
        const namaSupplier = data?.NamaSupplier;
        const jumlah = data?.Jumlah;
        const status = data?.Status;
        const taken = 0;
        if (namaBarang) {
          barangArray.push({
            ref,
            NamaBarang: namaBarang,
            NamaSupplier: namaSupplier,
            Jumlah: jumlah,
            Status: status,
            taken,
          });
        }
      });
  
      const filteredBarangArray = barangArray.filter((barang) => {
        let isInRange = true;
  
        if (status !== null) {
          isInRange = isInRange && (status === (barang.status ? 'baru' : 'sisa'));
        }
  
        if (barValue !== null) {
          isInRange = isInRange && (barang.jumlah <= barValue);
        }
  
        return isInRange;
      });

      sortData(filteredBarangArray);

      setBarangData(filteredBarangArray);
      setNamaBarangRekomendasi(filteredBarangArray.slice(0, 10));
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };      
  
  useEffect(() => {
    fetchInventory();
  }, []);   

  const handleNamaChange = (text) => {
    setNama(text);
    let filteredBarang = [];

    if (text === '') {
      filteredBarang = barangData;
    } else {
      const filterText = text.toLowerCase().trim();
      const filterItems = filterText.split(';').map((item) => item.trim());
      const filterNamaBarang = filterItems[1] ? filterItems[0].split(',').map((item) => item.trim().toLowerCase()) : [];
      const filterNamaSupplier = filterItems[2] ? filterItems[1].split(',').map((item) => item.trim().toLowerCase()) : [];

      filteredBarang = barangData.filter((item) => {
        if (filterNamaBarang.length > 0 && !filterNamaBarang.some((nama) => item.namaBarang.toLowerCase().includes(nama))) {
          return false;
        }
        if (filterNamaSupplier.length > 0 && !filterNamaSupplier.some((nama) => item.namaSupplier.toLowerCase().includes(nama))) {
          return false;
        }
        return true;
      });
    }

    setNamaBarangRekomendasi(filteredBarang.slice(0, 10));
  };

  const separateData = (data) => {
    const takenItems = data.filter((item) => item.taken > 0);
    const notTakenItems = data.filter((item) => item.taken === 0);
    
    sortData(takenItems);
    sortData(notTakenItems);
  
    setBarangData([...takenItems, ...notTakenItems]);
    setNamaBarangRekomendasi([...takenItems.slice(0, 10), ...notTakenItems.slice(0, 10)]);
  };
  
  const sortData = (data) => {
    data.sort((a, b) => {
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
  };

  const handleIncreaseQuantity = (item) => {
    const updatedData = barangData.map((barangItem) => {
      if (barangItem === item) {
        return { ...barangItem, taken: barangItem.taken + 1 };
      }
      return barangItem;
    });
    separateData(updatedData);
  };
  
  const handleDecreaseQuantity = (item) => {
    if (item.taken > 0) {
      const updatedData = barangData.map((barangItem) => {
        if (barangItem === item) {
          return { ...barangItem, taken: barangItem.taken - 1 };
        }
        return barangItem;
      });
      separateData(updatedData);
    }
  };
  
  const handleTake = async () => {
    const user = auth.currentUser;
    const updatedData = [];
    const materialsToUpdate = [];
  
    for (const item of barangData) {
      if (item.taken > 0) {
        const newQuantity = item.Jumlah - item.taken;
        const updatedItem = { ...item, Jumlah: newQuantity };
        updatedData.push(updatedItem);
  
        try {
          const logData = {
            timestamp: new Date().toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            refID: item.ref,
            userID: user.uid,
            action: `${item.NamaBarang}'s stock has been taken`,
          };
          await addDoc(collection(db, 'Log Data'), logData);
        } catch (error) {
          console.log('Failed to log data:', error);
        }
        materialsToUpdate.push({ stockID: item.ref, amount: item.taken });
      } else {
        updatedData.push(item);
      }
    }
  
    try {
      const batch = writeBatch(db);
  
      for (const item of updatedData) {
        const itemRef = doc(db, 'Inventory', item.ref);
        const incrementBy = -item.taken;
  
        batch.update(itemRef, { Jumlah: increment(incrementBy) });
      }
  
      await batch.commit();
      ToastAndroid.show('Stock Have Been Taken Sucessfully', ToastAndroid.SHORT);
  
      if (isRecordingForOrder && orderData?.orderID) {
        const orderDocRef = doc(db, 'Order', orderData.orderID);
        const orderDocSnap = await getDoc(orderDocRef);
      
        if (orderDocSnap.exists()) {
          const orderDataToUpdate = orderDocSnap.data();
      
          const existingMaterials = orderDataToUpdate.Materials || [];
          materialsToUpdate.forEach((materialToUpdate) => {
            const existingIndex = existingMaterials.findIndex(
              (material) => material.stockID === materialToUpdate.stockID
            );
      
            if (existingIndex !== -1) {
              existingMaterials[existingIndex].amount += materialToUpdate.amount;
            } else {
              existingMaterials.push(materialToUpdate);
            }
          });
      
          await updateDoc(orderDocRef, { Materials: existingMaterials });
          
          orderData.materials = existingMaterials;
      
          navigation.navigate('Order Detail', { orderData: orderData });
        }
      } else {
        navigation.navigate('Home');
      }      
    } catch (error) {
      console.log('Failed to update inventory:', error);
    }
  };
  
  const renderItem = ({ item }) => {
    const isTaken = item.taken > 0;

    return (
      <View style={[styles.listItem, isTaken ? styles.takenItem : null]}>
        <View style={styles.itemContainer}>
          <View style={styles.itemInfoContainer}>
            <Text style={styles.title}>{item.NamaBarang}</Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>{item.NamaSupplier}</Text>
            </View>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>Jumlah: {item.Jumlah}</Text>
            </View>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>Status: {item.Status ? 'Baru' : 'Sisa'}</Text>
            </View>
          </View>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleIncreaseQuantity(item)}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={item.taken.toString()}
              onChangeText={(text) => {
                const parsedValue = parseInt(text) || 0;
                const updatedData = barangData.map((barangItem) => {
                  if (barangItem === item) {
                    return { ...barangItem, taken: parsedValue };
                  }
                  return barangItem;
                });
                separateData(updatedData);
              }}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleDecreaseQuantity(item)}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    ToastAndroid.show('Refreshing...', ToastAndroid.SHORT);

    try {
      await fetchInventory();
      setCurrentPage(1);
    } catch (error) {
      console.log('Terjadi kesalahan saat merefresh data:', error);
    }

    setRefreshing(false);
  };

  const loadMoreData = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    const nextPage = currentPage + 1;
    const startIndex = 10 * (nextPage - 1);
    const endIndex = startIndex + 10;

    setNamaBarangRekomendasi((prevData) => [...prevData, ...barangData.slice(startIndex, endIndex)]);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    onRefresh();
  }, [status, barValue]);

  const FilterModal = () => {
    const [statusTemp, setStatusTemp] = useState(status);
    const [barValueTemp, setBarValueTemp] = useState(barValue);

    const handleResetFilter = () => {
      setStatusTemp(null);
      setBarValueTemp(null);
    };

    const handleFilterApply = () => {
      setStatus(statusTemp);
      setBarValue(barValueTemp);
      setShowFilterModal(false);
    };

    return(
      <Modal
        visible={showFilterModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalFilterGroup}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => {
                  if (statusTemp === null || statusTemp === 'sisa') {
                    setStatusTemp('baru');
                  } else {
                    setStatusTemp('sisa');
                  };
                }}
              >
                <Text style={styles.modalFilterTitle}>
                Status: {statusTemp !== null ? (statusTemp === 'baru' ? <Text style={styles.modalFilterOption}>Baru</Text> : <Text style={styles.modalFilterOption}>Sisa</Text>) : ''}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFilterGroup}>
              <Text style={styles.modalFilterTitle}>Jumlah kurang dari: </Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    if (barValueTemp === null) {
                      setBarValueTemp(1);
                    } else {
                      setBarValueTemp(barValueTemp + 1);
                    }
                  }}
                >
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => {
                    const numericValue = parseInt(text);
                    if (!isNaN(numericValue)) {
                      setBarValueTemp(numericValue);
                    } else {
                      setBarValueTemp(0);
                    }
                  }}
                  value={barValueTemp !== null ? barValueTemp.toString() : ''}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    if (barValueTemp === null || barValueTemp === 0) {
                      setBarValueTemp(0);
                    } else {
                      setBarValueTemp(barValueTemp - 1);
                    }
                  }}
                >
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={handleFilterApply}>
                <Text style={styles.modalApplyButton}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResetFilter}>
                <Text style={styles.modalResetButton}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  )};

  return (
    <View style={styles.container}>
      {namaBarangRekomendasi.length === 0 ? (
        <Text style={{
          marginTop: 20,
          fontSize: 16,
          textAlign: 'center',
          color: '#333333', 
        }}>Loading... If the loading process takes too long, it's possible that no data is found at the moment.</Text>
      ) : (
        <FlatList
          vertical
          showsVerticalScrollIndicator={false}
          data={namaBarangRekomendasi}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.NamaBarang + '-' + item.NamaSupplier + '-' + index}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListFooterComponent={isLoading && <ActivityIndicator size="small" />}
        />
      )}
      {showFilterModal && (
        <FilterModal />
      )}
  
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleTake}>
          <Text style={styles.addButtonText}>Take Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );  
}