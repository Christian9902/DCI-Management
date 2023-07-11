import React, { useEffect, useLayoutEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, StatusBar, Platform } from "react-native";
import styles from "./styles";
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth } from "../Login/LoginScreen";
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ClientInfoScreen(props) {
  const { navigation } = props;
  const [isAdmin, setIsAdmin] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [mostUsedMediaBy, setMostUsedMediaBy] = useState('');
  const [progressPercentage, setProgressPercentage] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [showReturnButton, setShowReturnButton] = useState(false);

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
    clientanalytic(filteredClients);
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

  const clientanalytic = (data) => {
    const mediaByCount = {};
    const progressCount = {};
    data.forEach((item) => {
      const mediaBy = item.By;
      if (mediaBy) {
        if (mediaByCount[mediaBy]) {
          mediaByCount[mediaBy]++;
        } else {
          mediaByCount[mediaBy] = 1;
        }
      }
  
      const progress = item.Progress;
      if (progress) {
        if (progressCount[progress]) {
          progressCount[progress]++;
        } else {
          progressCount[progress] = 1;
        }
      }
    });
  
    setClientCount(data.length);
  
    const mostUsedMediaBy = Object.keys(mediaByCount).reduce((a, b) => {
      return mediaByCount[a] > mediaByCount[b] ? a : b;
    }, '');
    setMostUsedMediaBy(mostUsedMediaBy);
  
    const totalProgressCount = data.length;
    const progressPercentage = {};
    Object.keys(progressCount).forEach((progress) => {
      const count = progressCount[progress];
      const percentage = (count / totalProgressCount) * 100;
      progressPercentage[progress] = percentage.toFixed(2);
    });
    setProgressPercentage(progressPercentage);
  };

  const filterClientByDate = (startDate, endDate) => {
    const formattedStartDate = formatDate(startDate.toLocaleString('en-GB'));
    const formattedEndDate = formatDate(endDate.toLocaleString('en-GB'));
  
    const filteredClientArray = clientData.filter((client) => {
      const formattedAddedDate = formatDate(client.Added);
      const isInRange = (
        formattedAddedDate[2] >= formattedStartDate[2] &&
        formattedAddedDate[1] >= formattedStartDate[1] &&
        formattedAddedDate[0] >= formattedStartDate[0] &&
        formattedAddedDate[2] <= formattedEndDate[2] &&
        formattedAddedDate[1] <= formattedEndDate[1] &&
        formattedAddedDate[0] <= formattedEndDate[0]
      );
      return isInRange;
    });
  
    setFilteredClients(filteredClientArray);
    clientanalytic(filteredClients);
  };  
  
  const formatDate = (date) => {
    const [dateString, _] = date.split(', ');
    const [day, month, year] = dateString.split('/');
  
    return [day, month, year]
  };           

  const handleFilterData = () => {
    if (startDate && endDate) {
      filterClientByDate(startDate, endDate);
      setShowReturnButton(true);
    } else {
      setFilteredClients(clientData);
    }
    clientanalytic(filteredClients);
  };
  
  const handleReturn = () => {
    setFilteredClients(clientData);
    setShowReturnButton(false);
    setStartDate(null);
    setEndDate(null);
  };

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
    setShowStartDatePicker(Platform.OS === 'ios');
  };

  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setEndDate(currentDate);
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

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text>Access denied. You must be an admin to view this screen.</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.button}>
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Jumlah Client: {clientCount}</Text>
      <Text>Media yang Paling Banyak Digunakan: {mostUsedMediaBy}</Text>
      <Text>Persentase Jumlah Client di Setiap Progress:</Text>
      {Object.keys(progressPercentage).map((progress) => (
        <Text key={progress} style={styles.point}>
          {progress}: {progressPercentage[progress]}%
        </Text>
      ))}

      <View style={styles.datePickerContainer}>
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

      <View style={styles.datePickerContainer}>
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

      <TouchableOpacity onPress={handleFilterData} style={styles.button2}>
        <Text style={styles.buttonText2}>Filter Data</Text>
      </TouchableOpacity>

      {showReturnButton && (
        <TouchableOpacity onPress={handleReturn} style={styles.button2}>
          <Text style={styles.buttonText2}>Return</Text>
        </TouchableOpacity>
      )}

      <StatusBar style="auto" />
    </View>
  );
}