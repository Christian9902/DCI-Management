import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, RefreshControl, ActivityIndicator, Pressable, ToastAndroid } from 'react-native';
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
            placeholder='Action; Time; User'
          />
          <Pressable onPress={() => { setText(""); }}>
            <Image style={styles.searchIcon} source={require("../../../assets/icons/close.png")} />
          </Pressable>
        </View>
      ),
      headerRight: () => <View />,
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
          user,
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
      /*
      const filterText = x.toLowerCase().trim();
      const filterItems = filterText.split(';').map((item) => item.trim());
      const filterAction = filterItems[0] ? filterItems[0].toLowerCase() : '';
      const filterTimestamp = filterItems[1] ? timeToArray(filterItems[1]) : [];
      const filterUserID = filterItems[2] ? filterItems[2].toLowerCase() : '';

      const filteredData = logData.filter((item) => {
        if (filterAction !== '' && !item.Action.toLowerCase().includes(filterAction)) {
          return false;
        }
        if (
          filterTimestamp.length !== 0 &&
          !filterTimestamp.every((filterValue, index) => {
            const itemValue = item.Time.split(/[\/,: ]/)[index];
            return itemValue.includes(filterValue);
          })
        ) {
          return false;
        }
        if (filterUserID !== '' && !item.User.toLowerCase().includes(filterUserID)) {
          return false;
        }
        return true;
      });

      setFilteredLogData(filteredData.slice(0, 10));
      */
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
    //navigation.navigate("OrderDetails", { order: item });
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
            <Text style={styles.category}>{item.time}</Text>
          </View>
          {isItemExpanded(item.id) && (
            <>
              <View style={styles.separator} />
              <View style={styles.categoryContainer}>
                <Text style={styles.category}>ID: {item.orderID}</Text>
              </View>
              <View style={styles.categoryContainer}>
                <Text style={styles.category}>User: {item.user}</Text>
              </View>
            </>
          )}
        </View>
        <TouchableOpacity onPress={() => toggleExpanded(item.id)}>
          <Text style={styles.expandButton}>{isItemExpanded(item.id) ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    ToastAndroid.show('Refreshing...', ToastAndroid.SHORT);

    try {
      await fetchOrderData();
    } catch (error) {
      console.log('Terjadi kesalahan saat merefresh data:', error);
    }

    setRefreshing(false);
  };

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