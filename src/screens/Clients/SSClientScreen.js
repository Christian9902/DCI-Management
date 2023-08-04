import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import MenuImage from "../../components/MenuImage/MenuImage";

export default function SSClientScreen({ navigation, route }) {
  const { clientDatabase } = route.params;

  const [data, setData] = useState([]);
  const [tableHead, setTableHead] = useState([]);
  const [widthArr, setWidthArr] = useState([]);

  const [isSort, setIsSort] = useState(true);

  const fields = [
    { key: 'Ref', title: '#ID', width: 150 },
    { key: 'NamaClient', title: 'Nama Client', width: 150 },
    { key: 'NamaPT', title: 'PT Client', width: 150 },
    { key: 'Job', title: 'Position', width: 100 },
    { key: 'Alamat', title: 'Alamat', width: 100 },
    { key: 'NoTelp', title: 'Telp', width: 100 },
    { key: 'Email', title: 'Email', width: 150 },
    { key: 'Progress', title: 'Progress', width: 100 },
    { key: 'Quo', title: 'Quo Submitted', width: 100 },
    { key: 'Since', title: 'Since', width: 100 },
    { key: 'By', title: 'Via', width: 100 },
  ];

  useEffect(() => {
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
      headerRight: () => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => setIsSort(!isSort)}>
            <Image style={styles.filterIcon} source={isSort ? require('../../../assets/icons/ascending.png') : require('../../../assets/icons/descending.png')} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Image style={styles.filterIcon} source={require('../../../assets/icons/filter.png')} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [isSort]);

  useEffect(() => {
    const rows = clientDatabase;
    const dataFields = fields;
    const tableHead = dataFields.map((field) => field.title);
    const widthArr = dataFields.map((field) => field.width);

    setTableHead(tableHead);
    setWidthArr(widthArr);
    setData(
      rows.map((row) => {
        return dataFields.map((field) => {
          if (field.key === 'Quo') {
            return row[field.key] ? 'Yes' : 'No';
          } else {
            return row[field.key];
          }
        });
      })
    );
  }, [clientDatabase]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal={true}>
        <View>
          <Table borderStyle={{ borderColor: '#C1C0B9' }}>
            <Row data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.headerText} />
          </Table>
          <ScrollView style={styles.dataWrapper}>
            <Table borderStyle={{ borderColor: '#C1C0B9' }}>
              <Rows data={data} textStyle={styles.text} widthArr={widthArr} />
            </Table>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    backgroundColor: '#242b38',
  },
  headerText: {
    textAlign: 'center',
    fontWeight: '100',
    color: 'white',
  },
  text: {
    textAlign: 'center',
    fontWeight: '100',
  },
  dataWrapper: {
    marginTop: -1,
  },
  filterIcon: {
    width: 25,
    height: 25,
    marginHorizontal: 20,
  },
});