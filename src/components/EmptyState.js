// d:\estudos\SwipeClean\src\components\EmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EmptyState({ icon = '✅', title = 'Tudo limpo!' }) {
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
