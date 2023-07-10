import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Text, View, Image, TouchableOpacity } from "react-native";
import styles from "./styles";
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth } from "../Login/LoginScreen";
import ToastNotification from "./toast";
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function HomeScreen(props) {
  const { navigation } = props;
  const [showAnimation, setShowAnimation] = useState(false);
  const [userName, setUserName] = useState('');

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

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUserName(userData.Nama);
          if (userData.Log === "OFF") {
            await updateDoc(doc(db, 'Users', user.uid), {
              Log: "ON",
            });
            setShowAnimation(true);
          } else {
            setShowAnimation(false);
          }
        }
      } catch (error) {
        console.log("Error fetching user name:", error);
      }
    }
  };

  const handleAddOrder = () => {
    navigation.navigate("Add Order");
  };

  return (
    <View style={styles.container}>
      {showAnimation && <ToastNotification userName={userName} />}

      <TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
        <Image source={require("../../../assets/icons/add.png")} style={styles.addButtonIcon} />
      </TouchableOpacity>
    </View>
  );
}
