import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
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
        } else {
          console.log('c');
        }
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };    

  const handleUpdate = async () => {
    const user = auth.currentUser;
  
    if (user) {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
  
      reauthenticateWithCredential(user, credential)
        .then(() => {
          updateEmail(user, email)
          .then(() => {
            console.log('Email updated successfully.');
          })
          .catch((error) => {
            console.log('Error updating email:', error);
          });

          const userRef = doc(db, 'Users', user.uid);
          updateDoc(userRef, {
            Nama: nama,
            NoTelp: noTelp,
          })
            .then(() => {
              console.log('Name and phone number updated successfully.');
            })
            .catch((error) => {
              console.log('Error updating name and phone number:', error);
            });

          if (password != '') {
            updatePassword(user, password)
            .then(() => {
              console.log('Password updated successfully.');
            })
            .catch((error) => {
              console.log('Error updating password:', error);
            });
          }

          const logEntry = {
            timestamp: new Date().toISOString(),
            action: 'Profile Updated',
            user: user.uid,
          };
          addDoc(collection(db, 'Log Data'), logEntry)
            .then(() => {
              console.log('Log entry added successfully.');
            })
            .catch((error) => {
              console.log('Error adding log entry:', error);
            });
        })
        .catch((error) => {
          console.log('Error reauthenticating user:', error);
        });
    }
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
              navigation.goBack();
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