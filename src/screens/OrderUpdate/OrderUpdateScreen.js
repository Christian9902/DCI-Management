import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { db } from '../Login/LoginScreen';
import { collection, getDocs } from 'firebase/firestore';

const OrderScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(db, 'Orders'));

      const orderArray = [];
      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        const namaProject = data?.NamaProject;
        const spesifikasi = data?.Spesifikasi;
        const harga = data?.Harga;
        const timeline = data?.Timeline;
        const progress = data?.Progress;

        if (namaProject) {
          orderArray.push({
            id: doc.id,
            NamaProject: namaProject,
            Spesifikasi: spesifikasi,
            Harga: harga,
            Timeline: timeline,
            Progress: progress,
          });
        }
      });

      setOrders(orderArray);
      setIsLoading(false);
    } catch (error) {
      console.log('Terjadi kesalahan saat mengambil data dari Firebase:', error);
      setIsLoading(false);
    }
  };

  const onPressItem = (item) => {
    console.log("Item yang diklik:", item);
    navigation.navigate("Order Update", { orderData: item, orderId: item.id });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onPressItem(item)}>
      <View style={styles.listItem}>
        <Text style={styles.title}>{item.NamaProject}</Text>
        <Text style={styles.category}>{item.Spesifikasi}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }

  return (
    <FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

export default OrderScreen;
