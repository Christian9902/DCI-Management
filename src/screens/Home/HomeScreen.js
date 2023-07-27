import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, RefreshControl, ActivityIndicator, Pressable, ToastAndroid, Modal } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db } from '../Login/LoginScreen';
import { collection, getDocs } from 'firebase/firestore';

export default function HomeScreen(props) {
  const [orderData, setOrderData] = useState([]);
  const [filteredOrderData, setFilteredOrderData] = useState([]);
  const [text, setText] = useState('');

  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState(null);
  const [quoSubmitted, setQuoSubmitted] = useState(null);
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
            onChangeText={handleSearch}
            value={text}
            placeholder='Nama Project'
          />
          <Pressable onPress={() => { setText(""); }}>
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
  }, [text]);

  const fetchOrderData = useCallback(async () => {
    try {
      const [orderSnapshot, userSnapshot] = await Promise.all([
        getDocs(collection(db, 'Order')),
        getDocs(collection(db, 'Users')),
      ]);
      const orderData = orderSnapshot.docs.map((doc) => {
        const data = doc.data();
        const orderID = doc.id;
        const project = data?.NamaProject;
        const namaClient = data?.NamaClient;
        const ptClient = data?.PTClient;
        const emailClient = data?.EmailClient;
        const notelpClient = data?.NoTelpClient;
        const attachment = data?.Attachment;
        const supplier = data?.Supplier;
        const time = data?.Timestamp;
        const harga = data?.Harga;
        const progress = data?.Progress;
        const spesifikasi = data?.Spesifikasi;
        const userRef = userSnapshot.docs.find((doc) => doc.id === data?.PIC);
        const user = userRef ? userRef.data().Nama : '';
  
        return {
          orderID,
          project,
          namaClient,
          ptClient,
          emailClient,
          notelpClient,
          attachment,
          supplier,
          time,
          harga,
          progress,
          spesifikasi,
          user,
          isExpanded: isItemExpanded(orderID),
        };
      });

      orderData.sort((a, b) => {
        const timeA = timeToArray(a.time);
        const timeB = timeToArray(b.time);

        for (let i = 0; i < timeA.length; i++) {
          if (timeA[i] !== timeB[i]) {
            return parseInt(timeB[i]) - parseInt(timeA[i]);
          }
        }

        return 0;
      });

      setOrderData(orderData);
      setFilteredOrderData(orderData.slice(0, 10));
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  }, []);

  useEffect(() => {
    fetchOrderData();
  }, []);

  const timeToArray = (time) => {
    const [day, month, yearOrTimeString] = time.split('/');
    let year = '';
    let hour = '';
    let minute = '';
    let second = '';

    if (yearOrTimeString && yearOrTimeString.includes(', ')) {
      const [yearString, timeString] = yearOrTimeString.split(', ');
      year = yearString;
      [hour, minute, second] = timeString.split(':');
    } else if (yearOrTimeString) {
      year = yearOrTimeString;
    }

    const filterTimestamp = [
      day || '',
      month || '',
      year || '',
      hour || '',
      minute || '',
      second || '',
    ];

    return filterTimestamp;
  };

  const handleSearch = (x) => {
    setText(x);

    if (x === '') {
      setFilteredOrderData(orderData.slice(0, 10));
    } else {
      const Text = x.toLowerCase();

      const filteredData = orderData.filter((item) => {
        if (Text !== '' && !item.project.toLowerCase().includes(Text)) {
          return false;
        }

        return true;
      });

      setFilteredOrderData(filteredData.slice(0, 10));
    }
  };

  const loadMoreData = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    const nextPage = currentPage + 1;
    const startIndex = 10 * (nextPage - 1);
    const endIndex = startIndex + 10;

    setFilteredOrderData((prevData) => [...prevData, ...orderData.slice(startIndex, endIndex)]);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  const onPressItem = (item) => {
    navigation.navigate("Order Update", { orderData: item, orderId: item.id });
  };

  const toggleExpanded = (itemId) => {
    setExpandedItems((prevExpandedItems) => {
      if (prevExpandedItems.includes(itemId)) {
        return prevExpandedItems.filter((id) => id !== itemId);
      } else {
        return [...prevExpandedItems, itemId];
      }
    });
  };

  const isItemExpanded = (itemId) => expandedItems.includes(itemId);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onPressItem(item)}>
      <View style={styles.listItem}>
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{item.project}</Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{item.namaClient} - {item.ptClient}</Text>
            <Text style={styles.category}>{item.time}</Text>
          </View>
          {isItemExpanded(item.orderID) && (
            <>
              <View style={styles.separator} />
              <View style={styles.categoryContainer}>
                <Text style={styles.category}>{item.orderID}</Text>
                <Text style={styles.category}>PIC: {item.user}</Text>
              </View>
            </>
          )}
        </View>
        <TouchableOpacity onPress={() => toggleExpanded(item.orderID)}>
          <Text style={styles.expandButton}>{isItemExpanded(item.orderID) ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    ToastAndroid.show('Refreshing...', ToastAndroid.SHORT);

    try {
      await fetchOrderData();
      setCurrentPage(1);
    } catch (error) {
      console.log('Terjadi kesalahan saat merefresh data:', error);
    }

    setRefreshing(false);
  };

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    onRefresh();
  }, [startDate, endDate, status, quoSubmitted]);

  const FilterModal = () => {
    const [startDateTemp, setStartDateTemp] = useState(startDate);
    const [endDateTemp, setEndDateTemp] = useState(endDate);
    const [statusTemp, setStatusTemp] = useState(status);
    const [quoSubmittedTemp, setQuoSubmittedTemp] = useState(quoSubmitted);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const handleResetFilter = () => {
      setStartDateTemp(null);
      setEndDateTemp(null);
      setStatusTemp(null);
      setQuoSubmittedTemp(null);
    };

    const handleFilterApply = () => {
      setStartDate(startDateTemp);
      setEndDate(endDateTemp);
      setStatus(statusTemp);
      setQuoSubmitted(quoSubmittedTemp);
      setShowFilterModal(false);
    };

    const handleStartDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || startDateTemp;
      const adjustedEndDate = endDateTemp && endDateTemp < currentDate ? currentDate : endDateTemp;
      setStartDateTemp(currentDate);
      setEndDateTemp(adjustedEndDate);
      setShowStartDatePicker(false);
    };
    
    const handleEndDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || endDateTemp;
      const adjustedStartDate = startDateTemp && startDateTemp > currentDate ? currentDate : startDateTemp;
      setEndDateTemp(currentDate);
      setStartDateTemp(adjustedStartDate);
      setShowEndDatePicker(false);
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
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.modalFilterTitle}>Start Date:</Text>
                <TouchableOpacity onPress={() => {setShowStartDatePicker(true)}}>
                  <Text style={styles.modalFilterOption}>{startDateTemp ? startDateTemp.toDateString() : 'Select Start Date'}</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDateTemp || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                  />
                )}
              </View>

              <View style={styles.datePickerColumn}>
                <Text style={styles.modalFilterTitle}>End Date:</Text>
                <TouchableOpacity onPress={() => {setShowEndDatePicker(true)}}>
                  <Text style={styles.modalFilterOption}>{endDateTemp ? endDateTemp.toDateString() : 'Select End Date'}</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDateTemp || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                  />
                )}
              </View>
            </View>

            <View style={styles.modalFilterGroup}>
              <Text style={styles.modalFilterTitle}>Status</Text>
              <TouchableOpacity onPress={() => setStatusTemp('Contacting')}>
                <Text style={[styles.modalFilterOption, statusTemp === 'Contacting' && styles.selectedOption]}>
                  {statusTemp === 'Contacting' ? '●' : '○'} Contacting
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStatusTemp('Compro Sent')}>
                <Text style={[styles.modalFilterOption, statusTemp === 'Compro Sent' && styles.selectedOption]}>
                  {statusTemp === 'Compro Sent' ? '●' : '○'} Compro Sent
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStatusTemp('Appointment')}>
                <Text style={[styles.modalFilterOption, statusTemp === 'Appointment' && styles.selectedOption]}>
                  {statusTemp === 'Appointment' ? '●' : '○'} Appointment
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStatusTemp('Schedule')}>
                <Text style={[styles.modalFilterOption, statusTemp === 'Schedule' && styles.selectedOption]}>
                  {statusTemp === 'Schedule' ? '●' : '○'} Schedule
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFilterGroup}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => {
                  setQuoSubmittedTemp(!quoSubmittedTemp);
                }}
              >
                <Text style={styles.modalFilterTitle}>
                  Quo Submitted: {quoSubmittedTemp ? <Text style={styles.modalFilterOption}>✓</Text> : ''}
                </Text>
              </TouchableOpacity>
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
      {filteredOrderData.length === 0 ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          vertical
          showsVerticalScrollIndicator={false}
          data={filteredOrderData}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.Timestamp + '-' + item.NamaProject + '-' + index
          }
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
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          navigation.navigate("Add Order");
        }}
      >
        <Image
          source={require("../../../assets/icons/add.png")}
          style={styles.addButtonIcon}
        />
      </TouchableOpacity>
    </>
  );
}
