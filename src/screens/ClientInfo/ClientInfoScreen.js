import React, { useEffect, useLayoutEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, StatusBar, Platform, ToastAndroid } from "react-native";
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
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const [prevFilteredClients, setPrevFilteredClients] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [quoSubmittedPercentage, setQuoSubmittedPercentage] = useState(0);
  const [quoSubmittedPercentage2, setQuoSubmittedPercentage2] = useState(0);
  const [mostActivePIC, setMostActivePIC] = useState('');
  const [mostActivePIC2, setMostActivePIC2] = useState('');
  const [showComparison, setShowComparison] = useState(false);

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
            <TouchableOpacity
              onPress={() => navigation.navigate("Clients")}
              style={styles.searchButton}
            >
              <Image
                source={require("../../../assets/icons/search.png")}
                style={styles.searchButtonImage}
              />
            </TouchableOpacity>
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

  useEffect(() => {
    clientAnalytic(filteredClients, true);
    clientAnalytic(prevFilteredClients, false);
  }, [filteredClients]);

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
      setFilteredClients(clients);
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

    if (x) {
      setClientCount(length);
    } else {
      setClientCount2(length);
    }
  
    const mostUsedMediaBy = {
      Email: 0,
      Whatsapp: 0,
      Instagram: 0,
      Telegram: 0,
      "Tik Tok": 0,
      Other: 0,
    };
    Object.keys(mediaByCount).forEach((media) => {
      const count = mediaByCount[media];
      const percentage = (count / length) * 100;
      mostUsedMediaBy[media] = percentage.toFixed(2);
    });
    if (x) {
      setMostUsedMediaBy(mostUsedMediaBy);
    } else {
      setMostUsedMediaBy2(mostUsedMediaBy);
    }
  
    const progressPercentage = { 
      Contacting: 0, 
      "Compro Sent": 0,
      Appointment: 0, 
      Schedule: 0
    };
    Object.keys(progressCount).forEach((progress) => {
      const count = progressCount[progress];
      const percentage = (count / length) * 100;
      progressPercentage[progress] = percentage.toFixed(2);
    });
    if (x) {
      setProgressPercentage(progressPercentage);
    } else {
      setProgressPercentage2(progressPercentage);
    }
  
    const quoSubmittedPercentage = (quoSubmittedCount / length) * 100;
    if (x) {
      setQuoSubmittedPercentage(quoSubmittedPercentage.toFixed(2));
    } else {
      setQuoSubmittedPercentage2(quoSubmittedPercentage.toFixed(2));
    }
  
    const mostActivePIC = Object.keys(picCount).reduce((a, b) => {
      return picCount[a] > picCount[b] ? a : b;
    }, '');
  
    if (mostActivePIC) {
      const userDoc = await getDoc(doc(db, 'Users', mostActivePIC));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const mostActivePICNama = userData.Nama;
        if (x) {
          setMostActivePIC(mostActivePICNama);
        } else {
          setMostActivePIC2(mostActivePICNama);
        }
      } else {
        if (x) {
          setMostActivePIC('');
        } else {
          setMostActivePIC2('');
        }
      }
    } else {
      if (x) {
        setMostActivePIC('');
      } else {
        setMostActivePIC2('');
      }
    }
  };
  
  const dateCalculator = (a, b) => {
    for (let i = 0; i < b; i++) {
      if (a[0] > 1) {
        a[0] -= 1;
      } else {
        a[1] -= 1;
        if (a[1] === 0) {
          a[1] = 12;
          a[2] -= 1;
        }
        a[0] = new Date(a[2], a[1], 0).getDate();
      }
    }
    return a.map((value) => String(value).padStart(2, "0"));
  };  
  
  const filterClientByDate = (startDate, endDate) => {
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
  
    const x = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  
    const prevMonthStartDate = dateCalculator([...formattedStartDate], x);
    const prevMonthEndDate = dateCalculator([...formattedStartDate], 1);
  
    const prevFilteredClientsArray = clientData.filter((client) => {
      const formattedAddedDate = formatDate(client.Added);
      const isInRange =
        formattedAddedDate[2] >= prevMonthStartDate[2] &&
        formattedAddedDate[1] >= prevMonthStartDate[1] &&
        formattedAddedDate[0] >= prevMonthStartDate[0] &&
        formattedAddedDate[2] <= prevMonthEndDate[2] &&
        formattedAddedDate[1] <= prevMonthEndDate[1] &&
        formattedAddedDate[0] <= prevMonthEndDate[0];
      return isInRange;
    });
  
    setFilteredClients(filteredClientArray);
    setPrevFilteredClients(prevFilteredClientsArray);
  };          

  const formatDate = (date) => {
    const [dateString, _] = date.split(', ');
    const [day, month, year] = dateString.split('/');

    return [day, month, year];
  };

  const handleFilterData = () => {
    if (startDate && endDate) {
      filterClientByDate(startDate, endDate);
      setShowReturnButton(true);
    } else {
      setFilteredClients(clientData);
    }
  };

  const handleReturn = () => {
    setFilteredClients(clientData);
    setShowReturnButton(false);
    setStartDate(null);
    setEndDate(null);
    setShowComparison(false);
  };

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    const adjustedEndDate = endDate && endDate < currentDate ? currentDate : endDate;
    setStartDate(currentDate);
    setEndDate(adjustedEndDate);
    setShowStartDatePicker(Platform.OS === 'ios');
  };
  
  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    const adjustedStartDate = startDate && startDate > currentDate ? currentDate : startDate;
    setEndDate(currentDate);
    setStartDate(adjustedStartDate);
    setShowEndDatePicker(Platform.OS === 'ios');
  };  

  const handleStartDatePicker = () => {
    setShowStartDatePicker(true);
  };

  const handleEndDatePicker = () => {
    setShowEndDatePicker(true);
  };

  const handleGoBack = () => {
    navigation.navigate("Home");
  };

  const handleCompare = () => {
    setShowComparison(!showComparison);
    if (showComparison){
      const formattedStartDate = formatDate(startDate.toLocaleString('en-GB'));
      const daysDifference = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const x = dateCalculator([...formattedStartDate], daysDifference);
      const y = dateCalculator([...formattedStartDate], 1);
      
      ToastAndroid.show(
        `Membandingkan dengan data ${x[0]}/${x[1]}/${x[2]} - ${y[0]}/${y[1]}/${y[2]}`,
        ToastAndroid.SHORT
      );
    }
  };
  

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
      <View style={styles.datePickerContainer}>
        <View style={styles.datePickerColumn}>
          <Text style={styles.datePickerText}>Start Date:</Text>
          <TouchableOpacity onPress={handleStartDatePicker}>
            <Text style={styles.datePicker}>{startDate ? startDate.toDateString() : 'Select Start Date'}</Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}
        </View>

        <View style={styles.datePickerColumn}>
          <Text style={styles.datePickerText}>End Date:</Text>
          <TouchableOpacity onPress={handleEndDatePicker}>
            <Text style={styles.datePicker}>{endDate ? endDate.toDateString() : 'Select End Date'}</Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
            />
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleFilterData} style={styles.button2}>
          <Text style={styles.buttonText2}>Filter Data</Text>
        </TouchableOpacity>

        {showReturnButton && (
          <>
            <TouchableOpacity onPress={handleCompare} style={styles.button2}>
              <Text style={styles.buttonText2}>Compare</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReturn} style={styles.button3}>
              <Text style={styles.buttonText3}>Reset </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.separator} />

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
      <StatusBar style="auto" />
    </View>
  );
}