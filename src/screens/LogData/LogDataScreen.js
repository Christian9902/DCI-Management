import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../Login/LoginScreen";
import styles from "./styles";

export default function LogDataScreen({ navigation }) {
  const [clientData, setClientData] = useState([]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const clientSnapshot = await getDocs(collection(db, 'Client'));
        const clientData = clientSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClientData(clientData);
      } catch (error) {
        console.log("Error fetching client data:", error);
      }
    };

    fetchClientData();
  }, []);

  const handleClientPress = (client) => {
    navigation.navigate("Client Update", { clientData: client });
  };

  return (
    <View style={styles.container}>
      {clientData.map((client, index) => (
        <TouchableOpacity
          key={index}
          style={styles.itemContainer}
          onPress={() => handleClientPress(client)}
        >
          <Text style={styles.title}>{client.NamaClient}</Text>
          <Text style={styles.category}>{client.NamaPT}</Text>
          <Text style={styles.category}>Status: {client.Progress}</Text>
          <Text style={styles.category}>PIC: {client.PIC}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
