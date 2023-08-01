import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Pressable, ActivityIndicator, ToastAndroid, RefreshControl, Modal } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db } from '../Login/LoginScreen';
import { collection, getDocs } from 'firebase/firestore';

export default function StocksScreen(props) {
  const [nama, setNama] = useState('');
  const [namaBarangRekomendasi, setNamaBarangRekomendasi] = useState([]);
  const [barangData, setBarangData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEndReached, setIsEndReached] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [status, setStatus] = useState(null);
  const [barValue, setBarValue] = useState(null);
  const isInitialRender = useRef(true);

  const { navigation } = props;

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
            placeholder='Barang1, Barang2, ...; Supplier1, Supplier2...'
          />
          <Pressable onPress={() => { setNama(""); handleNamaChange("") }}>
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
  }, [nama]);

  const fetchInventory = async () => {
    try {
      const inventorySnapshot = await getDocs(collection(db, 'Inventory'));
      const barangArray = [];
      inventorySnapshot.forEach((doc) => {
        const data = doc.data();
        const stockID = doc.id;
        const namaBarang = data?.NamaBarang;
        const namaSupplier = data?.NamaSupplier;
        const jumlah = data?.Jumlah;
        const status = data?.Status;
        const keterangan = data?.Keterangan;
        const harga = data?.Harga;
        if (namaBarang) {
          barangArray.push({
            stockID,
            namaBarang,
            namaSupplier,
            jumlah,
            status,
            keterangan,
            harga,
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

      filteredBarangArray.sort((a, b) => {
        const productNameA = a.namaBarang.toLowerCase();
        const productNameB = b.namaBarang.toLowerCase();
        const supplierNameA = a.namaSupplier.split('- ')[1]?.toLowerCase();
        const supplierNameB = b.namaSupplier.split('- ')[1]?.toLowerCase();

        if (productNameA < productNameB) return -1;
        if (productNameA > productNameB) return 1;
        if (supplierNameA < supplierNameB) return -1;
        if (supplierNameA > supplierNameB) return 1;
        return 0;
      });

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

  const onPressItem = (item) => {
    navigation.navigate('Stock Update', {stockData: item});
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onPressItem(item)}>
      <View style={styles.listItem}>
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{item.namaBarang}</Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{item.namaSupplier}</Text>
          </View>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>Jumlah: {item.jumlah}</Text>
          </View>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>Status: {item.status ? 'Baru' : 'Sisa'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
    if (isLoading || isEndReached) {
      return;
    }

    setIsLoading(true);
    const nextPage = currentPage + 1;
    const startIndex = 10 * (nextPage - 1);
    const endIndex = startIndex + 10;

    if (endIndex >= barangData.length) {
      setIsEndReached(true);
    }

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
    <>
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
          keyExtractor={(item, index) => item.namaBarang + '-' + item.namaSupplier + '-' + index}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={isLoading && <ActivityIndicator size="small" />}
        />
      )}
      {showFilterModal && (
        <FilterModal />
      )}
    </>
  );
}