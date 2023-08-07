import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Pressable, RefreshControl, ActivityIndicator, ToastAndroid, Modal, Platform } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth } from '../Login/LoginScreen';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ClientsScreen(props) {
  const [nama, setNama] = useState('');
  const [namaClientRekomendasi, setNamaClientRekomendasi] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState(null);
  const [quoSubmitted, setQuoSubmitted] = useState(null);
  const [pass, setPass] = useState([]);
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
            placeholder={pass[2] !== 'Marketing' ? 'Cari Nama Client / PT Client' : 'Cari Nama Client'}
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
  }, [nama, pass]);

  const fetchClient = async () => {
    try {
      const clientSnapshot = await getDocs(collection(db, 'Client'));
      const userSnapshot = await getDocs(collection(db, 'Users'));

      const clientArray = [];
      clientSnapshot.forEach((doc) => {
        const data = doc.data();
        const Ref = doc.id;
        const NamaClient = data?.NamaClient;
        const NamaPT = data?.NamaPT;
        const Progress = data?.Progress;
        const Alamat = data?.Alamat;
        const By = data?.By;
        const Email = data?.Email;
        const NoTelp = data?.NoTelp;
        const Note = data?.Note;
        const Quo = data?.QuoSubmitted;
        const Job = data?.JobPosition;
        const Since = data?.Added;
        const History = data?.History;

        const user = userSnapshot.docs.find((doc) => doc.id === data?.PIC);
        const PIC = user ? user.data().Nama : '';

        if (NamaClient) {
          clientArray.push({
            Ref,
            NamaClient,
            NamaPT,
            Progress,
            PIC,
            Alamat,
            By,
            Email,
            NoTelp,
            Note,
            Quo,
            Job,
            Since,
            History,
            isExpanded: isItemExpanded(Ref),
          });
        }
      });

      const filteredClientArray = clientArray.filter((client) => {
        const formattedAddedDate = formatDate(client.Since);
        let isInRange = true;

        if (pass[2] == 'Marketing' && pass[1] !== client.PIC) {
          isInRange = false;
        }
  
        if (startDate) {
          const formattedStartDate = formatDate(startDate.toLocaleString('en-GB'));
          isInRange = isInRange && (
            formattedAddedDate[2] > formattedStartDate[2] ||
            (formattedAddedDate[2] === formattedStartDate[2] &&
              (formattedAddedDate[1] > formattedStartDate[1] || (formattedAddedDate[1] === formattedStartDate[1] && formattedAddedDate[0] >= formattedStartDate[0]))));
        }
  
        if (endDate) {
          const formattedEndDate = formatDate(endDate.toLocaleString('en-GB'));
          isInRange = isInRange && (
            formattedAddedDate[2] < formattedEndDate[2] ||
            (formattedAddedDate[2] === formattedEndDate[2] &&
              (formattedAddedDate[1] < formattedEndDate[1] || (formattedAddedDate[1] === formattedEndDate[1] && formattedAddedDate[0] <= formattedEndDate[0]))));
        }
  
        if (status) {
          isInRange = isInRange && client.Progress === status;
        }
  
        if (quoSubmitted !== null) {
          isInRange = isInRange && client.Quo === quoSubmitted;
        }
  
        return isInRange;
      });

      filteredClientArray.sort((a, b) => {
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

      setClientData(filteredClientArray);
      setNamaClientRekomendasi(filteredClientArray.slice(0, 10));
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };

  useEffect(() => {
    checkUserPass();
  }, []);

  useEffect(() => {
    if (pass.length > 0) {
      fetchClient();
    }
  }, [pass]);

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

  const formatDate = (date) => {
    const [dateString, _] = date.split(', ');
    const [day, month, year] = dateString.split('/');

    return [day, month, year];
  };

  const handleNamaChange = (text) => {
    setNama(text);
    let filteredClient = [];
    if (text === '') {
      filteredClient = clientData;
    } else {
      filteredClient = clientData.filter((item) => {
        const namaClient = item.NamaClient.toLowerCase();
        const namaPT = item.NamaPT.toLowerCase();
        const filterText = text.toLowerCase().trim();

        return namaClient.includes(filterText) || namaPT.includes(filterText);
      });
    }
    setNamaClientRekomendasi(filteredClient.slice(0, 10));
  };

  const onPressItem = (item) => {
    navigation.navigate("Client Update", { clientData: item, clientDataRef: item.id });
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
          <Text style={styles.title}>{item.NamaClient}</Text>
          <Text style={styles.category}>{item.NamaPT}</Text>
          {isItemExpanded(item.Ref) && (
            <>
              <Text style={styles.separator}></Text>
              <Text style={styles.category}>Status: {item.Progress}</Text>
              <Text style={styles.category}>PIC: {item.PIC}</Text>
            </>
          )}
        </View>
        <TouchableOpacity onPress={() => toggleExpanded(item.Ref)}>
          <Text style={styles.expandButton}>{isItemExpanded(item.Ref) ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    ToastAndroid.show('Refreshing...', ToastAndroid.SHORT);

    try {
      await fetchClient();
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

    setNamaClientRekomendasi((prevData) => [...prevData, ...clientData.slice(startIndex, endIndex)]);
    setCurrentPage(nextPage);
    setIsLoading(false);
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
      {namaClientRekomendasi.length === 0 ? (
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
          data={namaClientRekomendasi}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.NamaClient + '-' + item.NamaPT + '-' + index}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListFooterComponent={isLoading && <ActivityIndicator size="small" />}
        />
      )}
      {pass[2] === 'Admin' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            navigation.navigate("SSClient", {clientDatabase: clientData});
          }}
        >
          <Image
            source={require("../../../assets/icons/spreadsheet.png")}
            style={styles.addButtonIcon}
          />
        </TouchableOpacity>
      )}
      {showFilterModal && (
        <FilterModal />
      )}
    </>
  );
}