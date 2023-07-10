import { useNavigation, useBackHandler } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, BackHandler, Alert } from 'react-native';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import styles from './styles';

const firebaseConfig = {
  apiKey: "AIzaSyDe2PJ7aGcAREEmOLKeGQNAKucbGkl62ss",
  authDomain: "inventarisgudangdci.firebaseapp.com",
  projectId: "inventarisgudangdci",
  storageBucket: "inventarisgudangdci.appspot.com",
  messagingSenderId: "844624800675",
  appId: "1:844624800675:web:8374b2378bc234f2d5c816"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    initializeApp(firebaseConfig);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('Home');
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        Alert.alert("Exit App", "Are you sure you want to exit?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel"
          },
          { text: "Exit", onPress: () => BackHandler.exitApp() }
        ]);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, (email + "@admin.com"), password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log('Logged in with:', user.email);
      })
      .catch((error) => alert('Check your email or password again!'));
  };

  function handlePress() {
    navigation.navigate("Home");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.logoName}>PT Dapoer Creative Indonesia</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Username"
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleLogin}
          // onPress={handlePress}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen;