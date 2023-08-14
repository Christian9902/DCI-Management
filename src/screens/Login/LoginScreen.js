import { useNavigation, useBackHandler } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from 'react';
import { KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View, Image, BackHandler, Alert, ToastAndroid } from 'react-native';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import styles from './styles';

const firebaseConfig = {
  apiKey: "AIzaSyANJEJdsMCcTMcjqNPbGoMK6xOxnbN6mnQ",
  authDomain: "dci-management-app.firebaseapp.com",
  projectId: "dci-management-app",
  storageBucket: "dci-management-app.appspot.com",
  messagingSenderId: "702924095017",
  appId: "1:702924095017:web:fcecfd501ae5488ec76638"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage();

const LoginScreen = () => {
  const emailRef = useRef(null);
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
    signInWithEmailAndPassword(auth, (email + "@dapoercreative.com"), password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        ToastAndroid.show(`Welcome! ${user.email}`, ToastAndroid.SHORT);
      })
      .catch((error) => {
        alert('Check your email or password again!');
        setEmail('');
        setPassword('');
        emailRef.current.focus();
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/icon2.png')}
          style={styles.logo}
        />
        <Text style={styles.logoName}>Dapoer Creative Indonesia</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          ref={emailRef}
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
          style={styles.button}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen;