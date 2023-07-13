import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Pressable } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db } from '../Login/LoginScreen';
import { collection, getDocs } from 'firebase/firestore';

export default function LogData(props) {
  const [action, setAction] = useState('');
  const [refID, setRefID] = useState([]);
  const [timestamp, setTimestamp] = useState([]);
  const [userID, setUserID] = useState([]);
  const [actionArray, setActionArray] = useState([]);

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
            onChangeText={handleActionChange}
            value={action}
            placeholder='Client Updated/Client Deleted; Timestamp,...'
          />
          <Pressable onPress={() => { setAction(""); handleActionChange(""); }}>
            <Image style={styles.searchIcon} source={require("../../../assets/icons/close.png")} />
          </Pressable>
        </View>
      ),
      headerRight: () => <View />,
    });
  }, [action]);

  const fetchLogData = async () => {
    try {
      const logdataSnapshot = await getDocs(collection(db, 'Log Data'));
      const actionData = [];
      logdataSnapshot.forEach((doc) => {
        const data = doc.data();
        const action = data?.action;
        const refID = data?.refID;
        const timestamp = data?.timestamp;
        const userID = data?.userID;
        if (action && refID && timestamp && userID) {
          actionData.push({
            action,
            refID,
            timestamp,
            userID,
          });
        }
      });
      setRefID(actionData);
      setTimestamp(actionData); // Menyimpan data langsung pada state timestamp
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };

  useEffect(() => {
    fetchLogData();
  }, []);

  const handleActionChange = (text) => {
    setAction(text);
    let filteredData = [];

    if (text === '') {
      filteredData = refID;
    } else {
      const filterText = text.toLowerCase().trim();
      const filterItems = filterText.split(';').map((item) => item.trim());
      const filterAction = filterItems[0].toLowerCase();
      const filterTimestamp = filterItems[1] ? filterItems[1].split(',').map((item) => item.trim().toLowerCase()) : [];
      const filterUserID = filterItems[2] ? filterItems[2].toLowerCase() : '';

      filteredData = refID.filter((item) => {
        if (filterAction !== '' && !item.action.toLowerCase().includes(filterAction)) {
          return false;
        }
        if (filterTimestamp.length > 0 && !filterTimestamp.some((timestamp) => item.timestamp.toLowerCase().includes(timestamp))) {
          return false;
        }
        if (filterUserID !== '' && item.userID.toLowerCase() !== filterUserID) {
          return false;
        }
        return true;
      });
    }

    setTimestamp(filteredData);
  };

  const onPressItem = (item) => {
    navigation.navigate("Home");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onPressItem(item)}>
      <View style={styles.listItem}>
        <View style={styles.itemContainer}>
          <Text style={styles.title}>{item.action}</Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{item.timestamp}</Text>
          </View>
          <Text>-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -</Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>RefID: {item.refID}</Text>
          </View>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>User ID: {item.userID}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      vertical
      showsVerticalScrollIndicator={false}
      data={timestamp}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.timestamp + '-' + item.action + '-' + index}
    />
  );
}
