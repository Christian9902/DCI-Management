import React, { useState } from "react";
import { View, Alert, Text } from "react-native";
import PropTypes from "prop-types";
import styles from "./styles";
import MenuButton from "../../components/MenuButton/MenuButton";
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from "../Login/LoginScreen";

export default function DrawerContainer(props) {
  const [isProductionGroupOpen, setIsProductionGroupOpen] = useState(false);
  const [isMarketingGroupOpen, setIsMarketingGroupOpen] = useState(false);
  const [isAnalyticsGroupOpen, setIsAnalyticsGroupOpen] = useState(false);

  const handleSignOut = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'Users', user.uid), {
          Log: "OFF",
        });
      } catch (error) {
        console.log("Error updating user log:", error);
      }
    }
  
    auth
      .signOut()
      .then(() => {
        navigation.navigate("Login");
      })
      .catch(error => alert(error.message));
  };

  const handleAddClient = () => {
    navigation.navigate("Add Client");
    navigation.closeDrawer();
  };

  const { navigation } = props;

  const toggleProductionGroup = () => {
    setIsProductionGroupOpen(!isProductionGroupOpen);
  };

  const toggleMarketingGroup = () => {
    setIsMarketingGroupOpen(!isMarketingGroupOpen);
  };

  const toggleAnalyticsGroup = () => {
    setIsAnalyticsGroupOpen(!isAnalyticsGroupOpen);
  };

  return (
    <View style={styles.content}>
      <View style={styles.container}>
        <MenuButton
          title="HOME"
          source={require("../../../assets/icons/home.png")}
          onPress={() => {
            navigation.navigate("Home");
            navigation.closeDrawer();
          }}
        />

        <MenuButton
          title="LOG DATA"
          source={require("../../../assets/icons/logdata.png")}
          onPress={() => {
            navigation.navigate("Log Data");
            navigation.closeDrawer();
          }}
        />

        <MenuButton
          title={`MARKETING${isMarketingGroupOpen ? "   ↑" : "   ↓"}`}
          source={require("../../../assets/icons/marketing.png")}
          onPress={toggleMarketingGroup}
        />
        {isMarketingGroupOpen && (
          <View style={styles.DropList}>
            
            <MenuButton
             title="ADD CLIENT"
             source={require("../../../assets/icons/addclient.png")}
             onPress={() => {
               navigation.navigate("Add Client");
               navigation.closeDrawer();
             }}
            />
          </View>
        )}

        <MenuButton
          title={`PRODUCTION${isProductionGroupOpen ? "   ↑" : "   ↓"}`}
          source={require("../../../assets/icons/production.png")}
          onPress={toggleProductionGroup}
        />
        {isProductionGroupOpen && (
          <View style={styles.DropList}>
            <MenuButton
              title="INVENTORY"
              source={require("../../../assets/icons/inventory.png")}
              onPress={() => {
                navigation.navigate("Stocks");
                navigation.closeDrawer();
              }}
            />
            <MenuButton
              title="ADD STOCK"
              source={require("../../../assets/icons/addstock.png")}
              onPress={() => {
                navigation.navigate("Add Stock");
                navigation.closeDrawer();
              }}
            />
            <MenuButton
              title="ADD SUPPLIER"
              source={require("../../../assets/icons/adduser.png")}
              onPress={() => {
                navigation.navigate("Add Supplier");
                navigation.closeDrawer();
              }}
            />
            <MenuButton
              title="TAKE"
              source={require("../../../assets/icons/take.png")}
              onPress={() => {
                navigation.navigate("Take");
                navigation.closeDrawer();
              }}
            />
          </View>
        )}

        <MenuButton
          title={`ANALYTICS${isAnalyticsGroupOpen ? "   ↑" : "   ↓"}`}
          source={require("../../../assets/icons/analytics.png")}
          onPress={toggleAnalyticsGroup}
        />
        {isAnalyticsGroupOpen && (
          <View style={styles.DropList}>
            <MenuButton
              title="CLIENT INFO"
              source={require("../../../assets/icons/clientinfo.png")}
              onPress={() => {
                navigation.navigate("Client Info");
                navigation.closeDrawer();
              }}
            />

            <MenuButton
              title="INCOME"
              source={require("../../../assets/icons/income.png")}
              onPress={() => {
                navigation.navigate("Income");
                navigation.closeDrawer();
              }}
            />
          </View>
        )}

        <MenuButton
          title="PROFILE"
          source={require("../../../assets/icons/user.png")}
          onPress={() => {
            navigation.navigate("Profile");
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="LOG OUT"
          source={require("../../../assets/icons/logout.png")}
          onPress={() => {
            handleSignOut();
            navigation.closeDrawer();
          }}
        />
      </View>
    </View>
  );
}

DrawerContainer.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    closeDrawer: PropTypes.func.isRequired,
  }),
};
