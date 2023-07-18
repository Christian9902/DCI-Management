import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Pressable, RefreshControl, ActivityIndicator, ToastAndroid } from 'react-native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";
import { db } from '../Login/LoginScreen';
import { collection, getDocs } from 'firebase/firestore';

export default function ClientsScreen(props) {
  const [nama, setNama] = useState('');
  const [namaClientRekomendasi, setNamaClientRekomendasi] = useState([]);
  const [clientData, setClientData] = useState([]);
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
            onChangeText={handleNamaChange}
            value={nama}
            placeholder='Nama Client / PT Client'
          />
          <Pressable onPress={() => { setNama(""); handleNamaChange("") }}>
            <Image style={styles.searchIcon} source={require("../../../assets/icons/close.png")} />
          </Pressable>
        </View>
      ),
      headerRight: () => <View />,
    });
  }, [nama]);

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
            isExpanded: isItemExpanded(Ref),
          });
        }
      });

      clientArray.sort((a, b) => {
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

      setClientData(clientArray);
      setNamaClientRekomendasi(clientArray.slice(0, 10));
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
    }
  };

  useEffect(() => {
    fetchClient();
  }, []);

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

  return (
    <>
      {namaClientRekomendasi.length === 0 ? (
        <Text>Loading...</Text>
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
    </>
  );
}