import React, { useEffect, useLayoutEffect, useState } from "react";
import { Text, View, TouchableOpacity, StatusBar } from "react-native";
import styles from "./styles";
import MenuImage from "../../components/MenuImage/MenuImage";
import { db, auth } from "../Login/LoginScreen";
import { doc, getDoc, collection } from 'firebase/firestore';

export default function HomeScreen(props) {
  const { navigation } = props;
  const [isAdmin, setIsAdmin] = useState(false);
  const [grossIncome, setGrossIncome] = useState(0);
  const [productionExpenses, setProductionExpenses] = useState(0);
  const [supportingExpenses, setSupportingExpenses] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [isShowingAllTime, setIsShowingAllTime] = useState(true);

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
    checkAdminStatus();
    calculateIncome();
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

  const calculateIncome = () => {
    // Menghitung pendapatan kotor, pengeluaran produksi, pengeluaran pendukung, dan pendapatan bersih
    // Gantilah logika perhitungan sesuai dengan kebutuhan Anda
    const calculatedGrossIncome = 10000;
    const calculatedProductionExpenses = 3000;
    const calculatedSupportingExpenses = 2000;
    const calculatedNetIncome = calculatedGrossIncome - calculatedProductionExpenses - calculatedSupportingExpenses;

    setGrossIncome(calculatedGrossIncome);
    setProductionExpenses(calculatedProductionExpenses);
    setSupportingExpenses(calculatedSupportingExpenses);
    setNetIncome(calculatedNetIncome);
  };

  const handleGoBack = () => {
    navigation.navigate("Home");
  };

  const handleToggleTimeFrame = () => {
    setIsShowingAllTime(!isShowingAllTime);
    // Lakukan logika perubahan data berdasarkan waktu yang dipilih di sini
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
      <View style={styles.timeFrameContainer}>
        <TouchableOpacity
          onPress={handleToggleTimeFrame}
          style={[styles.timeFrameButton, isShowingAllTime ? styles.activeTimeFrameButton : null]}
        >
          <Text style={[styles.timeFrameButtonText, isShowingAllTime ? styles.activeTimeFrameButtonText : null]}>
            All Time
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleToggleTimeFrame}
          style={[styles.timeFrameButton, !isShowingAllTime ? styles.activeTimeFrameButton : null]}
        >
          <Text style={[styles.timeFrameButtonText, !isShowingAllTime ? styles.activeTimeFrameButtonText : null]}>
            This Month
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Pendapatan Bersih:</Text>
      <Text style={styles.value}>{netIncome}</Text>
      <Text style={styles.label}>Pendapatan Kotor:</Text>
      <Text style={styles.value}>{grossIncome}</Text>
      <Text style={styles.label}>Pengeluaran Produksi:</Text>
      <Text style={styles.value}>{productionExpenses}</Text>
      <Text style={styles.label}>Pengeluaran pendukung:</Text>
      <Text style={styles.value}>{supportingExpenses}</Text>
      <StatusBar style="auto" />
    </View>
  );
}
