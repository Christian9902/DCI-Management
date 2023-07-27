import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Text, View, TouchableOpacity, Image, StatusBar, ToastAndroid, Modal } from "react-native";
import styles from "./styles";
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth } from "../Login/LoginScreen";
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ClientInfoScreen(props) {
  const { navigation } = props;
  const [isAdmin, setIsAdmin] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [clientCount2, setClientCount2] = useState(0);
  const [mostUsedMediaBy, setMostUsedMediaBy] = useState({});
  const [mostUsedMediaBy2, setMostUsedMediaBy2] = useState({});
  const [progressPercentage, setProgressPercentage] = useState({});
  const [progressPercentage2, setProgressPercentage2] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startDate2, setStartDate2] = useState(null);
  const [endDate2, setEndDate2] = useState(null);
  const [clientData, setClientData] = useState([]);
  const [quoSubmittedPercentage, setQuoSubmittedPercentage] = useState(0);
  const [quoSubmittedPercentage2, setQuoSubmittedPercentage2] = useState(0);
  const [mostActivePIC, setMostActivePIC] = useState('');
  const [mostActivePIC2, setMostActivePIC2] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
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
      headerRight: () => {
        if (isAdmin) {
          return (
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Clients")}
                style={styles.searchButton}
              >
                <Image
                  source={require("../../../assets/icons/search.png")}
                  style={styles.searchButtonImage}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilterModal(true)}>
                <Image style={styles.filterIcon} source={require('../../../assets/icons/filter.png')} />
              </TouchableOpacity>
            </View>
          );
        } else {
          return <View />;
        }
      },
    });
  }, [navigation, isAdmin]);

  useEffect(() => {
    checkAdminStatus();
    fetchClientInfo();
  }, []);

  const checkAdminStatus = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.Status === "Admin");
        }
      } catch (error) {
        console.log("Error checking admin status:", error);
      }
    }
  };

  const fetchClientInfo = async () => {
    try {
      const clientSnapshot = await getDocs(collection(db, 'Client'));
      const clients = [];

      clientSnapshot.forEach((doc) => {
        clients.push(doc.data());
      });

      setClientData(clients);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };

  const clientAnalytic = async (data, x) => {
    const mediaByCount = {};
    const progressCount = {};
    const picCount = {};
    let quoSubmittedCount = 0;
    const length = data.length;
  
    data.forEach((item) => {
      const mediaBy = item.By;
      if (mediaBy) {
        mediaByCount[mediaBy] = (mediaByCount[mediaBy] || 0) + 1;
      }
  
      const progress = item.Progress;
      if (progress) {
        progressCount[progress] = (progressCount[progress] || 0) + 1;
      }
  
      if (item.QuoSubmitted) {
        quoSubmittedCount++;
      }
  
      const pic = item.PIC;
      if (pic) {
        picCount[pic] = (picCount[pic] || 0) + 1;
      }
    });

    x ? setClientCount(length) : setClientCount2(length);

    const mostUsedMediaBy = { Email: 0, Whatsapp: 0, Instagram: 0, Telegram: 0, "Tik Tok": 0, Other: 0 };
    Object.keys(mediaByCount).forEach((media) => {
      const count = mediaByCount[media];
      const percentage = (count / length) * 100;
      mostUsedMediaBy[media] = percentage.toFixed(2);
    });
    x ? setMostUsedMediaBy(mostUsedMediaBy) : setMostUsedMediaBy2(mostUsedMediaBy);

    const progressPercentage = { Contacting: 0, "Compro Sent": 0, Appointment: 0, Schedule: 0 };
    Object.keys(progressCount).forEach((progress) => {
      const count = progressCount[progress];
      const percentage = (count / length) * 100;
      progressPercentage[progress] = percentage.toFixed(2);
    });
    x ? setProgressPercentage(progressPercentage) : setProgressPercentage2(progressPercentage);

    const quoSubmittedPercentage = (quoSubmittedCount / length) * 100;
    x ? setQuoSubmittedPercentage(quoSubmittedPercentage.toFixed(2)) : setQuoSubmittedPercentage2(quoSubmittedPercentage.toFixed(2));

    const mostActivePIC = Object.keys(picCount).reduce((a, b) => {
      return picCount[a] > picCount[b] ? a : b;
    }, '');
    if (mostActivePIC) {
      const userDoc = await getDoc(doc(db, 'Users', mostActivePIC));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const mostActivePICNama = userData.Nama;
        x ? setMostActivePIC(mostActivePICNama) : setMostActivePIC2(mostActivePICNama);
      } else {
        x ? setMostActivePIC('') : setMostActivePIC2('');
      }
    } else {
      x ? setMostActivePIC('') : setMostActivePIC2('');
    }
  };
  
  const filterClientByDate = (startDate, endDate, x) => {
    const formattedStartDate = formatDate(startDate.toLocaleString('en-GB'));
    const formattedEndDate = formatDate(endDate.toLocaleString('en-GB'));
  
    const filteredClientArray = clientData.filter((client) => {
      const formattedAddedDate = formatDate(client.Added);
      const isInRange =
        formattedAddedDate[2] >= formattedStartDate[2] &&
        formattedAddedDate[1] >= formattedStartDate[1] &&
        formattedAddedDate[0] >= formattedStartDate[0] &&
        formattedAddedDate[2] <= formattedEndDate[2] &&
        formattedAddedDate[1] <= formattedEndDate[1] &&
        formattedAddedDate[0] <= formattedEndDate[0];
      return isInRange;
    });
    clientAnalytic(filteredClientArray, x);
  };          

  const formatDate = (date) => {
    const [dateString, _] = date.split(', ');
    const [day, month, year] = dateString.split('/');

    return [day, month, year];
  };

  const handleGoBack = () => {
    navigation.navigate("Home");
  };

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (startDate !== null && endDate !== null) {
      filterClientByDate(startDate, endDate, true);
      if (startDate2 !== null && endDate2 !== null) {
        filterClientByDate(startDate2, endDate2, false);
        setShowComparison(true);
      } else {
        setShowComparison(false);
      }
    } else {
      clientAnalytic(clientData, true);
    }
  }, [clientData, startDate, endDate, startDate2, endDate2]);

  const FilterModal = () => {
    const [startDateTemp, setStartDateTemp] = useState(startDate);
    const [endDateTemp, setEndDateTemp] = useState(endDate);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const [startDateTemp2, setStartDateTemp2] = useState(startDate2);
    const [endDateTemp2, setEndDateTemp2] = useState(endDate2);
    const [showStartDatePicker2, setShowStartDatePicker2] = useState(false);
    const [showEndDatePicker2, setShowEndDatePicker2] = useState(false);

    const handleResetFilter = () => {
      setStartDateTemp(null);
      setEndDateTemp(null);
      setStartDateTemp2(null);
      setEndDateTemp2(null);
    };

    const handleFilterApply = () => {
      setStartDate(startDateTemp);
      setEndDate(endDateTemp);
      setStartDate2(startDateTemp2);
      setEndDate2(endDateTemp2);
      setShowFilterModal(false);
    };

    const handleStartDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || startDateTemp;
      const adjustedEndDate = endDateTemp && endDateTemp < currentDate ? currentDate : endDateTemp;
      setShowStartDatePicker(false);
      setStartDateTemp(currentDate);
      setEndDateTemp(adjustedEndDate);
    };

    const handleStartDateChange2 = (event, selectedDate) => {
      const currentDate = selectedDate || startDateTemp2;
      const adjustedEndDate = endDateTemp2 && endDateTemp2 < currentDate ? currentDate : endDateTemp2;
      setShowStartDatePicker2(false);
      setStartDateTemp2(currentDate);
      setEndDateTemp2(adjustedEndDate);
    };
    
    const handleEndDateChange = (event, selectedDate) => {
      const currentDate = selectedDate || endDateTemp;
      const adjustedStartDate = startDateTemp && startDateTemp > currentDate ? currentDate : startDateTemp;
      setShowEndDatePicker(false);
      setEndDateTemp(currentDate);
      setStartDateTemp(adjustedStartDate);
    };

    const handleEndDateChange2 = (event, selectedDate) => {
      const currentDate = selectedDate || endDateTemp2;
      const adjustedStartDate = startDateTemp2 && startDateTemp2 > currentDate ? currentDate : startDateTemp2;
      setShowEndDatePicker2(false);
      setEndDateTemp2(currentDate);
      setStartDateTemp2(adjustedStartDate);
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
                  <Text style={styles.modalFilterOption}>{startDateTemp ? startDateTemp.toDateString() : 'Pick Date'}</Text>
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
                  <Text style={styles.modalFilterOption}>{endDateTemp ? endDateTemp.toDateString() : 'Pick Date'}</Text>
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

            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.modalFilterTitle}>Start Date 2:</Text>
                <TouchableOpacity onPress={() => {setShowStartDatePicker2(true)}}>
                  <Text style={styles.modalFilterOption}>{startDateTemp2 ? startDateTemp2.toDateString() : 'Pick Date'}</Text>
                </TouchableOpacity>
                {showStartDatePicker2 && (
                  <DateTimePicker
                    value={startDateTemp2 || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange2}
                  />
                )}
              </View>

              <View style={styles.datePickerColumn}>
                <Text style={styles.modalFilterTitle}>End Date 2:</Text>
                <TouchableOpacity onPress={() => {setShowEndDatePicker2(true)}}>
                  <Text style={styles.modalFilterOption}>{endDateTemp2 ? endDateTemp2.toDateString() : 'Pick Date'}</Text>
                </TouchableOpacity>
                {showEndDatePicker2 && (
                  <DateTimePicker
                    value={endDateTemp2 || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange2}
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
  
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text>Access denied. You must be an admin to view this screen.</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.button}>
          <Text style={styles.buttonText2}>Home</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {startDate !== null && endDate !== null && (
        <Text style={styles.dateRangeText}>{startDate?.toLocaleString('en-GB').split(',')[0]} - {endDate?.toLocaleString('en-GB').split(',')[0]}</Text>
      )}
      {startDate2 !== null && endDate2 !== null && (
        <Text style={styles.dateRangeText}>Comparison Date : {startDate2?.toLocaleString('en-GB').split(',')[0]} - {endDate2?.toLocaleString('en-GB').split(',')[0]}</Text>
      )}
      <Text>
        Jumlah Client: {clientCount}
        {showComparison && (
          <Text> // {clientCount2}</Text>
        )}
      </Text>
      <Text>
        Quo Submitted: {quoSubmittedPercentage}%
        {showComparison && (
          <Text> // {quoSubmittedPercentage2}%</Text>
        )}
      </Text>
      <Text></Text>
      <Text>Media yang Paling Banyak Digunakan:</Text>
        {Object.keys(mostUsedMediaBy).map((media) => (
          <Text key={media} style={styles.point}>
            {media}: {mostUsedMediaBy[media]}%
            {showComparison && (
              <Text> // {mostUsedMediaBy2[media]}%</Text>
            )}
          </Text>
        ))}
      <Text></Text>
      <Text>Persentase Jumlah Client di Setiap Progress:</Text>
      {Object.keys(progressPercentage).map((progress) => (
        <Text key={progress} style={styles.point}>
          {progress}: {progressPercentage[progress]}%
          {showComparison && (
            <Text> // {progressPercentage2[progress]}%</Text>
          )}
        </Text>
      ))}
      <Text></Text>
      <Text>Top PIC: {mostActivePIC}
      {showComparison && (
        <Text> // {mostActivePIC2}</Text>
      )}
      </Text>
      {showFilterModal && (
        <FilterModal />
      )}
      <StatusBar style="auto" />
    </View>
  );
}