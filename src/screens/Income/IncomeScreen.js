import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Text, View, TouchableOpacity, Image, StatusBar, Modal } from "react-native";
import styles from "./styles";
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth } from "../Login/LoginScreen";
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function IncomeScreen(props) {
  const { navigation } = props;
  const [orderData, setOrderData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startDate2, setStartDate2] = useState(null);
  const [endDate2, setEndDate2] = useState(null);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [incomeTotal2, setIncomeTotal2] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [orderCount2, setOrderCount2] = useState(0);
  const [grossIncomeTotal, setGrossIncomeTotal] = useState(0);
  const [grossIncomeTotal2, setGrossIncomeTotal2] = useState(0);
  const [materialCostTotal, setMaterialCostTotal] = useState(0);
  const [materialCostTotal2, setMaterialCostTotal2] = useState(0);
  const [supplierCostTotal, setSupplierCostTotal] = useState(0);
  const [supplierCostTotal2, setSupplierCostTotal2] = useState(0);
  const [topClients, setTopClients] = useState([]);
  const [topClients2, setTopClients2] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [topSuppliers2, setTopSuppliers2] = useState([]);
  
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
        return (
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <TouchableOpacity onPress={() => setShowFilterModal(true)}>
              <Image style={styles.filterIcon} source={require('../../../assets/icons/filter.png')} />
            </TouchableOpacity>
          </View>
        );
      },
    });
  }, [navigation]);

  useEffect(() => {
    fetchOrderInfo();
  }, []);

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
    let totalSupplierCost = 0;
    let clientIncomeMap = new Map();
    let supplierCostMap = new Map();
  
    for (const order of data) {
      let materialCost = 0;
      let supplierCost = 0;
  
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

      for (let i = 0; i < order.Supplier.length; i += 1) {
        const supplierID = order.Supplier[i].namaSupplier + ' - ' + order.Supplier[i].PTSupplier;
        const supplierPrice = parseInt(order.Supplier[i].harga);
        supplierCost += supplierPrice;
        if (supplierCostMap.has(supplierID)) {
          supplierCostMap.set(supplierID, supplierCostMap.get(supplierID) + supplierPrice);
        } else {
          supplierCostMap.set(supplierID, supplierPrice);
        }
      }

      totalGrossIncome += parseInt(order.Harga);
      totalMaterialCost += materialCost;
      totalSupplierCost += supplierCost;
  
      const clientID = order.NamaClient + ' - ' + order.PTClient;
      const clientIncome = parseInt(order.Harga);
      if (clientIncomeMap.has(clientID)) {
        clientIncomeMap.set(clientID, clientIncomeMap.get(clientID) + clientIncome);
      } else {
        clientIncomeMap.set(clientID, clientIncome);
      }
    }
  
    const clientIncomeArray = Array.from(clientIncomeMap, ([ID, value]) => ({ ID, value }));
    const supplierCostArray = Array.from(supplierCostMap, ([ID, value]) => ({ ID, value }));

    clientIncomeArray.sort((a, b) => b.value - a.value);
    supplierCostArray.sort((a, b) => b.value - a.value);

    const top5Clients = clientIncomeArray.slice(0, 5);
    const top5Suppliers = supplierCostArray.slice(0, 5);

    x ? setGrossIncomeTotal(totalGrossIncome) : setGrossIncomeTotal2(totalGrossIncome);
    x ? setMaterialCostTotal(totalMaterialCost) : setMaterialCostTotal2(totalMaterialCost);
    x ? setSupplierCostTotal(totalSupplierCost) : setSupplierCostTotal2(totalSupplierCost);
    x ? setOrderCount(data.length) : setOrderCount2(data.length);
    const totalIncome = totalGrossIncome - totalMaterialCost - totalSupplierCost;
    x ? setIncomeTotal(totalIncome) : setIncomeTotal2(totalIncome);

    x ? setTopClients(top5Clients) : setTopClients2(top5Clients);
    x ? setTopSuppliers(top5Suppliers) : setTopSuppliers2(top5Suppliers);
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

  const renderTopClients = (clients) => {
    return clients.map((client) => (
      <View key={client.ID}>
        <Text style={styles.point}>
          {client.ID}: {client.value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
        </Text>
      </View>
    ));
  };
  
  const renderTopSuppliers = (suppliers) => {
    return suppliers.map((supplier) => (
      <Text key={supplier.ID} style={styles.point}>
        {supplier.ID}: {supplier.value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
      </Text>
    ));
  }

  const calculatePercentageChange = (oldValue, newValue) => {
    const percentageChange = ((oldValue - newValue) / Math.abs(oldValue)) * 100;
    return percentageChange.toFixed(2);
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

  return (
    <View style={styles.container2}>
      {startDate !== null && endDate !== null && (
        <Text style={styles.dateRangeText}>{startDate?.toLocaleString('en-GB').split(',')[0]} - {endDate?.toLocaleString('en-GB').split(',')[0]}</Text>
      )}
      {startDate2 !== null && endDate2 !== null && (
        <Text style={styles.dateRangeText}>Comparison Date : {startDate2?.toLocaleString('en-GB').split(',')[0]} - {endDate2?.toLocaleString('en-GB').split(',')[0]}</Text>
      )}
      <Text>
        Total Order Count: {orderCount}
        {showComparison && (
          <Text>
            // {orderCount2}
            ({calculatePercentageChange(orderCount, orderCount2)}%)
            </Text>
        )}
      </Text>
      <Text></Text>
      <Text>
        Total Income: {grossIncomeTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
        {showComparison && (
          <Text>
            // {grossIncomeTotal2.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
            ({calculatePercentageChange(grossIncomeTotal, grossIncomeTotal2)}%)
          </Text>
        )}
      </Text>
      {renderTopClients(topClients)}
      {showComparison && (
        <>
          <View style={styles.separator} />
          {renderTopClients(topClients2)}
        </>
      )}
      <Text></Text>
      <Text>
        Total Vendor Cost: {supplierCostTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
        {showComparison && (
          <Text>
            // {supplierCostTotal2.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
            ({calculatePercentageChange(supplierCostTotal, supplierCostTotal2)}%)
          </Text>
        )}
      </Text>
      {renderTopSuppliers(topSuppliers)}
      {showComparison && (
        <>
          <View style={styles.separator} />
          {renderTopSuppliers(topSuppliers2)}
        </>
      )}
      <Text></Text>
      <Text>
        Total Material Cost: {materialCostTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
        {showComparison && (
          <Text>
            // {materialCostTotal2.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
            ({calculatePercentageChange(materialCostTotal, materialCostTotal2)}%)
          </Text>
        )}
      </Text>
      <Text></Text>
      <Text>
        Total Revenue: {incomeTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
        {showComparison && (
          <Text>
            // {incomeTotal2.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
            ({calculatePercentageChange(incomeTotal, incomeTotal2)}%)
          </Text>
        )}
      </Text>
      {showFilterModal && (
        <FilterModal />
      )}
      <StatusBar style="auto" />
    </View>
  );
}