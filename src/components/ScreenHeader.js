import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ScreenHeader({ title, subtitle, onBack, children }) {
  // Se tiver botão de voltar, o layout muda para Row (horizontal)
  const isRowLayout = !!onBack;

  return (
    <View style={[styles.container, isRowLayout ? styles.rowContainer : styles.centerContainer]}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
      )}
      
      <View style={!isRowLayout && styles.centerContent}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Permite inserir conteúdo extra, como o ScoreBoard */}
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 45, // Ajuste para Status Bar se necessário
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  centerContainer: {
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  backButton: {
    marginRight: 20,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  childrenContainer: {
    marginTop: 15,
    width: '100%',
  }
});