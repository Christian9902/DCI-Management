import React, { useState, useEffect } from "react";
import { View, ToastAndroid } from "react-native";
import PropTypes from "prop-types";
import styles from "./styles";
import MenuButton from "../../components/MenuButton/MenuButton";
import { db, auth } from "../Login/LoginScreen";
import { getDoc, doc } from 'firebase/firestore';

export default function DrawerContainer(props) {
  const [isProductionGroupOpen, setIsProductionGroupOpen] = useState(false);
  const [isMarketingGroupOpen, setIsMarketingGroupOpen] = useState(false);
  const [isAnalyticsGroupOpen, setIsAnalyticsGroupOpen] = useState(false);
  const [pass, setPass] = useState([]);

  useEffect(() => {
    checkUserPass();
  }, []);

  const checkUserPass = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPass([user.uid, userData.Nama, userData.Status]);
        }
      } catch (error) {
        console.trace(error);
      }
    }
  };

  const handleSignOut = async () => {
    const user = auth.currentUser;
  
    auth
      .signOut()
      .then(() => {
        navigation.navigate("Login");
      })
      .catch(error => alert(error.message));
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
          title={`MARKETING${isMarketingGroupOpen ? "   ▲"  : "   ▼"}`}
          source={require("../../../assets/icons/marketing.png")}
          onPress={toggleMarketingGroup}
        />
        {isMarketingGroupOpen && (
          <View style={styles.DropList}>
            
            
            <MenuButton
             title="CLIENTS"
             source={require("../../../assets/icons/clients.png")}
             onPress={() => {
              if (pass[2] !== 'Production') {
                navigation.navigate("Clients");
                navigation.closeDrawer();
              } else {
                ToastAndroid.show('Not Permitted', ToastAndroid.SHORT);
              }
             }}
            />
            <MenuButton
             title="ADD CLIENT"
             source={require("../../../assets/icons/addclient.png")}
             onPress={() => {
              if (pass[2] !== 'Production') {
                navigation.navigate("Add Client");
                navigation.closeDrawer();
              } else {
                ToastAndroid.show('Not Permitted', ToastAndroid.SHORT);
              }
             }}
            />
          </View>
        )}

        <MenuButton
          title={`PRODUCTION${isProductionGroupOpen ? "   ▲"  : "   ▼"}`}
          source={require("../../../assets/icons/production.png")}
          onPress={toggleProductionGroup}
        />
        {isProductionGroupOpen && (
          <View style={styles.DropList}>
            <MenuButton
              title="INVENTORY"
              source={require("../../../assets/icons/inventory.png")}
              onPress={() => {
                if (pass[2] !== 'Marketing') {
                  navigation.navigate("Stocks");
                  navigation.closeDrawer();
                } else {
                  ToastAndroid.show('Not Permitted', ToastAndroid.SHORT);
                }
              }}
            />
            <MenuButton
              title="ADD STOCK"
              source={require("../../../assets/icons/addstock.png")}
              onPress={() => {
                if (pass[2] !== 'Marketing') {
                  navigation.navigate("Add Stock");
                  navigation.closeDrawer();
                } else {
                  ToastAndroid.show('Not Permitted', ToastAndroid.SHORT);
                }
              }}
            />
            <MenuButton
              title="TAKE STOCK"
              source={require("../../../assets/icons/take.png")}
              onPress={() => {
                if (pass[2] !== 'Marketing') {
                  navigation.navigate('Take', {
                    orderData: [],
                    isRecordingForOrder: false,
                  })
                  navigation.closeDrawer();
                } else {
                  ToastAndroid.show('Not Permitted', ToastAndroid.SHORT);
                }
              }}
            />
            <MenuButton
             title="SUPPLIERS"
             source={require("../../../assets/icons/suppliers.png")}
             onPress={() => {
              if (pass[2] !== 'Marketing') {
                navigation.navigate("Suppliers");
                navigation.closeDrawer();
              } else {
                ToastAndroid.show('Not Permitted', ToastAndroid.SHORT);
              }
             }}
            />
            <MenuButton
              title="ADD SUPPLIER"
              source={require("../../../assets/icons/addsupplier.png")}
              onPress={() => {
                if (pass[2] !== 'Marketing') {
                  navigation.navigate("Add Supplier");
                  navigation.closeDrawer();
                } else {
                  ToastAndroid.show('Not Permitted', ToastAndroid.SHORT);
                }
              }}
            />
          </View>
        )}

        <MenuButton
          title={`ANALYTICS${isAnalyticsGroupOpen ? "   ▲"  : "   ▼"}`}
          source={require("../../../assets/icons/analytics.png")}
          onPress={toggleAnalyticsGroup}
        />
        {isAnalyticsGroupOpen && (
          <View style={styles.DropList}>
            <MenuButton
              title="CLIENT INFO"
              source={require("../../../assets/icons/clientinfo.png")}
              onPress={() => {
                if (pass[2] === 'Admin') {
                  navigation.navigate("Client Info");
                  navigation.closeDrawer();
                } else {
                  ToastAndroid.show('Not Permitted', ToastAndroid.SHORT);
                }
              }}
            />

            <MenuButton
              title="INCOME"
              source={require("../../../assets/icons/income.png")}
              onPress={() => {
                if (pass[2] === 'Admin') {
                  navigation.navigate("Income");
                  navigation.closeDrawer();
                } else {
                  ToastAndroid.show('Not Permitted', ToastAndroid.SHORT);
                }
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
