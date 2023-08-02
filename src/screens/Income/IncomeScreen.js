import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Text, View, TouchableOpacity, Image, StatusBar, ToastAndroid, Modal } from "react-native";
import styles from "./styles";
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth } from "../Login/LoginScreen";
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function IncomeScreen(props) {
  const { navigation } = props;
  const [orderData, setOrderData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startDate2, setStartDate2] = useState(null);
  const [endDate2, setEndDate2] = useState(null);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [incomeTotal2, setIncomeTotal2] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [orderCount2, setOrderCount2] = useState(0);
  const [uniqueOrder, setUniqueOrder] = useState(0);
  const [uniqueOrder2, setUniqueOrder2] = useState(0);
  const [grossIncomeTotal, setGrossIncomeTotal] = useState(0);
  const [grossIncomeTotal2, setGrossIncomeTotal2] = useState(0);
  const [materialCostTotal, setMaterialCostTotal] = useState(0);
  const [materialCostTotal2, setMaterialCostTotal2] = useState(0);
  
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
    fetchOrderInfo();
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
        console.trace(error);
      }
    }
  };

  const fetchOrderInfo = async () => {
    try {
      const orderSnapshot = await getDocs(collection(db, 'Order'));
      const orders = [];

      orderSnapshot.forEach((doc) => {
        const orderData = doc.data();
        const orderID = doc.id
        if (orderData.isDone) {
          orderData.orderID = orderID;
          orders.push(orderData);
        }
      });

      setOrderData(orders);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };

  const orderAnalytic = async (data, x) => {
    let totalGrossIncome = 0;
    let totalMaterialCost = 0;
  
    for (const order of data) {
      let materialCost = 0;
  
      for (let i = 0; i < order.Materials.length; i += 1) {
        const stockID = order.Materials[i].stockID;
        const amount = order.Materials[i].amount;
  
        try {
          const materialDocRef = doc(db, 'Inventory', stockID);
          const materialDocSnap = await getDoc(materialDocRef);
  
          if (materialDocSnap.exists()) {
            const materialData = materialDocSnap.data();
            const pricePerUnit = materialData.Harga || 0;
            materialCost += pricePerUnit * amount;
          }
        } catch (error) {
          console.log('Failed to fetch material data:', error);
        }
      }
  
      totalGrossIncome += order.Harga;
      totalMaterialCost += materialCost;
    }
  
    x ? setGrossIncomeTotal(totalGrossIncome) : setGrossIncomeTotal2(totalGrossIncome);
    x ? setMaterialCostTotal(totalMaterialCost) : setMaterialCostTotal2(totalMaterialCost);
    x ? setOrderCount(data.length) : setOrderCount2(data.length);
    const totalIncome = totalGrossIncome - totalMaterialCost;
    x ? setIncomeTotal(totalIncome) : setIncomeTotal2(totalIncome);
  };  
  
  const filterByDate = (startDate, endDate, x) => {
    const formattedStartDate = formatDate(startDate.toLocaleString('en-GB'));
    const formattedEndDate = formatDate(endDate.toLocaleString('en-GB'));
  
    const filteredOrderArray = orderData.filter((order) => {
      const formattedAddedDate = formatDate(order.isDoneTime);
      const isInRange =
        formattedAddedDate[2] >= formattedStartDate[2] &&
        formattedAddedDate[1] >= formattedStartDate[1] &&
        formattedAddedDate[0] >= formattedStartDate[0] &&
        formattedAddedDate[2] <= formattedEndDate[2] &&
        formattedAddedDate[1] <= formattedEndDate[1] &&
        formattedAddedDate[0] <= formattedEndDate[0];
      return isInRange;
    });
    orderAnalytic(filteredOrderArray, x);
  };          

  const formatDate = (date) => {
    const [dateString, _] = date.split(', ');
    const [day, month, year] = dateString.split('/');

    return [day, month, year];
  };

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (startDate !== null && endDate !== null) {
      filterByDate(startDate, endDate, true);
      if (startDate2 !== null && endDate2 !== null) {
        filterByDate(startDate2, endDate2, false);
        setShowComparison(true);
      } else {
        setShowComparison(false);
      }
    } else {
      orderAnalytic(orderData, true);
    }
  }, [orderData, startDate, endDate, startDate2, endDate2]);

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
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.button}>
          <Text style={styles.buttonText}>Home</Text>
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
      <Text>Total Order Count: {orderCount}</Text>
      <Text>Total Gross Income: {grossIncomeTotal}</Text>
      <Text>Total Material Cost: {materialCostTotal}</Text>
      <Text>Total Income: {incomeTotal}</Text>
      {showFilterModal && (
        <FilterModal />
      )}
      <StatusBar style="auto" />
    </View>
  );
}