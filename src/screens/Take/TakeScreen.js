import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import MenuImage from "../../components/MenuImage/MenuImage";

const dummyBarang = [
  { id: '1', nama: 'Barang 1' },
  { id: '2', nama: 'Barang 2' },
  { id: '3', nama: 'Barang 3' },
  { id: '4', nama: 'Barang 4' },
  { id: '5', nama: 'Barang 5' },
];

export default function AmbilScreen(props) {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBarang, setFilteredBarang] = useState(dummyBarang);
  const [jumlahBarang, setJumlahBarang] = useState({});

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
      headerRight: () => <View />,
    });
  }, [navigation]);

  const handleSearch = (text) => {
    setSearchQuery(text);

    const filteredData = dummyBarang.filter((barang) =>
      barang.nama.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredBarang(filteredData);
  };

  const handleTambah = (item) => {
    setJumlahBarang((prevJumlah) => ({
      ...prevJumlah,
      [item.id]: prevJumlah[item.id] ? prevJumlah[item.id] + 1 : 1,
    }));
  };

  const handleKurang = (item) => {
    if (jumlahBarang[item.id] && jumlahBarang[item.id] > 0) {
      setJumlahBarang((prevJumlah) => ({
        ...prevJumlah,
        [item.id]: prevJumlah[item.id] - 1,
      }));
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.nama}</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleTambah(item)}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
      <Text style={styles.jumlahText}>{jumlahBarang[item.id] || 0}</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleKurang(item)}>
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
    </View>
  );

  const handleOke = () => {
    console.log('Jumlah Barang:', jumlahBarang);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Nama Barang"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredBarang}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity style={styles.buttonOke} onPress={handleOke}>
        <Text style={styles.buttonTextOke}>Oke</Text>
      </TouchableOpacity>
    </View> );
}