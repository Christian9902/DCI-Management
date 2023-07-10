import React, { useEffect, useLayoutEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, StatusBar } from "react-native";
import styles from "./styles";
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth } from "../Login/LoginScreen";
import { doc, getDoc } from 'firebase/firestore';

export default function HomeScreen(props) {
  const { navigation } = props;
  const [isAdmin, setIsAdmin] = useState(false);

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
        if (isAdmin) {
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              style={styles.searchButton}
            >
              <Image
                source={require("../../../assets/icons/search.png")}
                style={styles.searchButtonImage}
              />
            </TouchableOpacity>
          );
        } else {
          return <View />;
        }
      },
    });
  }, [navigation, isAdmin]);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.Status === "Admin");
        }
      } catch (error) {
        console.log("Error checking admin status:", error);
      }
    }
  };

  const handleGoBack = () => {
    navigation.navigate("Home");
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text>Access denied. You must be an admin to view this screen.</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.button}>
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}