import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ToastAndroid } from 'react-native';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { auth, db } from '../Login/LoginScreen';
import MenuImage from "../../components/MenuImage/MenuImage";
import styles from './style';

export default function ProfileScreen(props) {
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nama, setNama] = useState('');
  const [noTelp, setNoTelp] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email);
        const userSnapshot = await getDoc(doc(db, 'Users', user.uid));
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setNama(userData.Nama);
          setNoTelp(userData.NoTelp);
          setStatus(userData.Status);
        }
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };    

  const handleUpdate = async () => {
    const user = auth.currentUser;
    let log = [];
  
    if (user) {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
  
      reauthenticateWithCredential(user, credential)
        .then(() => {
          const updateEmailPromise = updateEmail(user, email)
            .then(() => {
              log.push('0');
            })
            .catch((error) => {
              log.push(`1`);
            });
  
          const userRef = doc(db, 'Users', user.uid);
          const updateProfilePromise = updateDoc(userRef, {
            Nama: nama,
            NoTelp: noTelp,
          })
            .then(() => {
              log.push('0');
            })
            .catch((error) => {
              log.push(`1`);
            });
  
          const updatePasswordPromise = password !== '' ? updatePassword(user, password)
            .then(() => {
              log.push('0');
            })
            .catch((error) => {
              log.push(`1`);
            }) : Promise.resolve();
  
          const logEntry = {
            timestamp: new Date().toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            action: 'Profile Updated',
            user: user.uid,
          };
          const addLogEntryPromise = addDoc(collection(db, 'Log Data'), logEntry)
            .then(() => {
              log.push('0');
            })
            .catch((error) => {
              log.push(`1`);
            });
  
          Promise.all([updateEmailPromise, updateProfilePromise, updatePasswordPromise, addLogEntryPromise])
            .then(() => {
              ToastAndroid.show(log.join('<-'), ToastAndroid.SHORT);
              setPassword('');
              setOldPassword('');
              setShowPassword(false);
              handleSignOut();
            })
            .catch((error) => {
              ToastAndroid.show(`Terjadi error saat mengupdate data: ${error}`, ToastAndroid.LONG);
            });
        })
        .catch((error) => {
          ToastAndroid.show(`Terjadi error saat mengupdate data: ${error}`, ToastAndroid.LONG);
        });
    }
  };    
  
  const handleSignOut = async () => {
    const user = auth.currentUser;
  
    auth
      .signOut()
      .then(() => {
        navigation.navigate("Login");
      })
      .catch(error => alert(error));
  };

  const handleCancel = () => {
    setEmail('');
    setPassword('');
    setOldPassword('');
    setNama('');
    setNoTelp('');
    setStatus('');

    navigation.navigate('Home');
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text>Status:</Text>
        <Text style={styles.status}>{status}</Text>
        <Text>Nama:</Text>
        <TextInput
          style={styles.input}
          value={nama}
          onChangeText={setNama}
        />
        <Text>No Telp:</Text>
        <TextInput
          style={styles.input}
          value={noTelp}
          onChangeText={setNoTelp}
        />
        <Text>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <Text>New Password:</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder='Insert your new password here'
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <View style={styles.separator} />
          <TextInput
            style={styles.input}
            placeholder='Insert your old password here to change your data'
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Text style={styles.passwordVisibilityButton}>
              {showPassword ? 'Hide Password' : 'Show Password'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              handleUpdate();
            }}
          >
            <Text>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleCancel()}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}