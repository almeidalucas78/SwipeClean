import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SmartCleanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✨ Limpeza Inteligente</Text>
      <Text style={styles.subtitle}>Em breve: Screenshots e imagens inúteis</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 10 }
});