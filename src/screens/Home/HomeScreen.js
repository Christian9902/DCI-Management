import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Text, View, TouchableHighlight, Image, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import styles from "./styles";
import MenuImage from "../../components/MenuImage/MenuImage";
import { db } from "../Login/LoginScreen";

export default function HomeScreen(props) {
  const { navigation } = props;

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
  }, []);

  const handleAddOrder = () => {
    navigation.navigate("Add Order");
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />

      <TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
        <Image source={require("../../../assets/icons/add.png")} style={styles.addButtonIcon} />
      </TouchableOpacity>
    </View>
  );
}