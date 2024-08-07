import { auth } from '../../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, router } from 'expo-router';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function SignIn() {
  const [value, setValue] = React.useState({
    email: '',
    password: '',
    error: ''
  });

  // Reset state when component unmounts or user navigates away
  const resetFields = () => {
    setValue({
      email: '',
      password: '',
      error: ''
    });
  };

  async function signIn() {
    setValue((currentValue) => {

      if (!currentValue.email || !currentValue.password) {
        return { ...currentValue, error: 'Please enter both email and password.' };
      }

      signInWithEmailAndPassword(auth, currentValue.email, currentValue.password)
        .then((userCredential) => {
          if (userCredential.user.emailVerified) {
            router.replace('/(screens)/home');
          } else {
            router.replace('/(auth)/verify-email');
          }
        })
        .catch(() => {
          setValue((prevValue) => ({ ...prevValue, error: 'Invalid email or password. Please try again.' }));
        });

      // Return the current value without changes
      return currentValue;
    });
  }

  async function resetPassword() {
    setValue(currentValue => {
      if (currentValue.email === '') {
        return { ...currentValue, error: 'Please enter your email to reset password' };
      }

      sendPasswordResetEmail(auth, currentValue.email)
        .then(() => {
          setValue({ ...currentValue, error: 'Password reset email sent!' });
        })
        .catch(() => {
          setValue((prevValue) => ({ ...prevValue, error: 'Invalid email. Please try again.' }));
        });

      return currentValue;
    });
  }

  return (
    <View className="flex-1 pt-20 bg-white items-center justify-top p-4">
      <Text className="text-6xl font-bold mb-4">Sign In</Text>

      {!!value.error && (
        <View className="mt-2 p-2 bg-red-500 rounded">
          <Text className="text-white">{value.error}</Text>
        </View>
      )}

      <View className="w-full">
        <View className="flex-row items-center border-b border-gray-300 py-2 mb-4">
          <Ionicons name="mail-outline" size={24} color="gray" />
          <TextInput
            className="flex-1 ml-2"
            placeholder="Email"
            value={value.email}
            onChangeText={(text) => setValue((prevValue) => ({ ...prevValue, email: text }))}
          />
        </View>

        <View className="flex-row items-center border-b border-gray-300 py-2 mb-4">
          <Ionicons name="key-outline" size={24} color="gray" />
          <TextInput
            className="flex-1 ml-2"
            placeholder="Password"
            value={value.password}
            onChangeText={(text) => setValue((prevValue) => ({ ...prevValue, password: text }))}
            secureTextEntry={true}
          />
        </View>

        <Pressable
          className="bg-green-700 py-2 px-4 rounded active:bg-green-800"
          onPress={signIn}
        >
          {({ pressed }) => (
            <Text className={`text-white text-center font-bold ${pressed ? 'opacity-75' : ''}`}>
              Sign in
            </Text>
          )}
        </Pressable>

        <Pressable
          className="mt-4"
          onPress={resetPassword}
        >
          {({ pressed }) => (
            <Text className={`text-center text-gray-600 ${pressed ? 'opacity-75' : ''}`}>
              Reset your password
            </Text>
          )}
        </Pressable>

        <Link href="/signup" asChild>
          <Pressable
            className="mt-4"
            onPress={resetFields}>
            {({ pressed }) => (
              <Text className={`text-center text-gray-600 ${pressed ? 'opacity-75' : ''}`}>
                Sign up
              </Text>
            )}
          </Pressable>
        </Link>
      </View>
    </View>
  );
}