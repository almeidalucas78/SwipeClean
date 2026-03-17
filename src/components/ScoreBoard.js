import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme'; // <-- IMPORT DO TEMA

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
    backgroundColor: theme.colors.surface, // Fundo neutro do tema
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreText: {
    color: theme.colors.primary, // Azul do tema
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  scoreValue: {
    color: theme.colors.primary, // Azul do tema
    fontSize: 24,
    fontWeight: '900',
  },
});