import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, RefreshControl, Pressable, ToastAndroid } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db } from '../Login/LoginScreen';
import { collection, getDocs } from 'firebase/firestore';

export default function LogData(props) {
  const [logData, setLogData] = useState([]);
  const [filteredLogData, setFilteredLogData] = useState([]);
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

  const fetchLogData = useCallback(async () => {
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

      logData.sort((a, b) => {
        const timeA = timeToArray(a.Time);
        const timeB = timeToArray(b.Time);

        for (let i = 0; i < timeA.length; i++) {
          if (timeA[i] !== timeB[i]) {
            return parseInt(timeB[i]) - parseInt(timeA[i]);
          }
        }

        return 0;
      });

      setLogData(logData);
      setFilteredLogData(logData.slice(0, 10));
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  }, [isItemExpanded]);

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
    navigation.navigate("Home");
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
    </TouchableOpacity>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    ToastAndroid.show('Refreshing...', ToastAndroid.SHORT);

    try {
      await fetchLogData();
    } catch (error) {
      console.log('Terjadi kesalahan saat merefresh data:', error);
    }

    setRefreshing(false);
  };

  return (
    <>
      {filteredLogData.length === 0 ? (
        <Text>Loading...</Text>
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
    </>
  );
}