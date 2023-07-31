import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, RefreshControl, Pressable, ToastAndroid, Modal } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db } from '../Login/LoginScreen';
import { collection, getDocs } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LogData(props) {
  const [logData, setLogData] = useState([]);
  const [filteredLogData, setFilteredLogData] = useState([]);
  const [text, setText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date);
  const [endDate, setEndDate] = useState(new Date);
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
            placeholder='Action; User'
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

  const fetchLogData = async () => {
    try {
      const [logdataSnapshot, userSnapshot] = await Promise.all([
        getDocs(collection(db, 'Log Data')),
        getDocs(collection(db, 'Users')),
      ]);
      const logData = logdataSnapshot.docs.map((doc) => {
        const data = doc.data();
        const logID = doc.id;
        const action = data?.action;
        const refID = data?.refID;
        const timestamp = data?.timestamp;
        const userRef = userSnapshot.docs.find((doc) => doc.id === data?.userID);
        const user = userRef ? userRef.data().Nama : '';
        if (action) {
          return {
            id: logID,
            Action: action,
            RefID: refID,
            Time: timestamp,
            User: user,
            isExpanded: isItemExpanded(logID),
          };
        } else {
          return null;
        }
      }).filter((item) => item !== null);

      const filteredLogDataArray = logData.filter((log) => {
        const formattedAddedDate = timeToArray(log.Time);
        let isInRange = true;
  
        if (startDate) {
          const formattedStartDate = timeToArray(startDate.toLocaleString('en-GB'));
          isInRange =
            formattedAddedDate[2] > formattedStartDate[2] ||
            (formattedAddedDate[2] === formattedStartDate[2] &&
              (formattedAddedDate[1] > formattedStartDate[1] || (formattedAddedDate[1] === formattedStartDate[1] && formattedAddedDate[0] >= formattedStartDate[0])));
        }
  
        if (endDate) {
          const formattedEndDate = timeToArray(endDate.toLocaleString('en-GB'));
          isInRange = isInRange && (
            formattedAddedDate[2] < formattedEndDate[2] ||
            (formattedAddedDate[2] === formattedEndDate[2] &&
              (formattedAddedDate[1] < formattedEndDate[1] || (formattedAddedDate[1] === formattedEndDate[1] && formattedAddedDate[0] <= formattedEndDate[0]))));
        }
  
        return isInRange;
      });

      filteredLogDataArray.sort((a, b) => {
        const timeA = timeToArray(a.Time);
        const timeB = timeToArray(b.Time);
      
        for (let i = 2; i >= 0; i--) {
          if (timeA[i] !== timeB[i]) {
            return parseInt(timeB[i]) - parseInt(timeA[i]);
          }
        }
      
        for (let i = 3; i <= 5; i++) {
          if (timeA[i] !== timeB[i]) {
            return parseInt(timeB[i]) - parseInt(timeA[i]);
          }
        }
      
        return 0;
      });

      setLogData(filteredLogDataArray);
      setFilteredLogData(filteredLogDataArray.slice(0, 10));
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };

  useEffect(() => {
    fetchLogData();
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
      setFilteredLogData(logData.slice(0, 10));
    } else {
      const filterText = x.toLowerCase().trim();
      const filterItems = filterText.split(';').map((item) => item.trim());
      const filterAction = filterItems[0] ? filterItems[0].toLowerCase() : '';
      const filterUserID = filterItems[2] ? filterItems[2].toLowerCase() : '';

      const filteredData = logData.filter((item) => {
        if (filterAction !== '' && !item.Action.toLowerCase().includes(filterAction)) {
          return false;
        }
        if (filterUserID !== '' && !item.User.toLowerCase().includes(filterUserID)) {
          return false;
        }
        return true;
      });

      setFilteredLogData(filteredData.slice(0, 10));
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

    setFilteredLogData((prevData) => [...prevData, ...logData.slice(startIndex, endIndex)]);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  const onPressItem = (item) => {
    //navigation.navigate("Home");
    console.log(item);
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
    <View style={styles.listItem}>
      <View style={styles.itemContainer}>
        <Text style={styles.title}>{item.Action}</Text>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{item.Time}</Text>
        </View>
        {isItemExpanded(item.id) && (
          <>
            <View style={styles.separator} />
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>LogID: {item.id}</Text>
            </View>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>RefID: {item.RefID}</Text>
            </View>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>User: {item.User}</Text>
            </View>
          </>
        )}
      </View>
      <TouchableOpacity onPress={() => toggleExpanded(item.id)}>
        <Text style={styles.expandButton}>{isItemExpanded(item.id) ? '▲' : '▼'}</Text>
      </TouchableOpacity>
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    ToastAndroid.show('Refreshing...', ToastAndroid.SHORT);

    try {
      await fetchLogData();
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
  }, [startDate, endDate]);

  const FilterModal = () => {
    const [startDateTemp, setStartDateTemp] = useState(startDate);
    const [endDateTemp, setEndDateTemp] = useState(endDate);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const handleResetFilter = () => {
      setStartDateTemp(null);
      setEndDateTemp(null);
    };

    const handleFilterApply = () => {
      setStartDate(startDateTemp);
      setEndDate(endDateTemp);
      setShowFilterModal(false);
    };

    const handleStartDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || startDateTemp;
      const adjustedEndDate = endDateTemp && endDateTemp < currentDate ? currentDate : endDateTemp;
      setShowStartDatePicker(false);
      setStartDateTemp(currentDate);
      setEndDateTemp(adjustedEndDate);
    };
    
    const handleEndDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || endDateTemp;
      const adjustedStartDate = startDateTemp && startDateTemp > currentDate ? currentDate : startDateTemp;
      setShowEndDatePicker(false);
      setEndDateTemp(currentDate);
      setStartDateTemp(adjustedStartDate);
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
      {filteredLogData.length === 0 ? (
        <Text>Loading... if it takes to long to load maybe there is no data found</Text>
      ) : (
        <FlatList
          vertical
          showsVerticalScrollIndicator={false}
          data={filteredLogData}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.timestamp + '-' + item.action + '-' + index}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListFooterComponent={isLoading && <ActivityIndicator size="small" />}
        />
      )}
      {showFilterModal && (
        <FilterModal />
      )}
    </>
  );
}