import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ScoreBoard({ label = "Espaço a libertar:", value, unit = "MB" }) {
  return (
    <View style={styles.scoreBoard}>
      <Text style={styles.scoreText}>{label}</Text>
      <Text style={styles.scoreValue}>{value} {unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreBoard: {
    backgroundColor: '#E6F4FE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  scoreText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  scoreValue: {
    color: '#007AFF',
    fontSize: 24,
    fontWeight: '900',
  },
});