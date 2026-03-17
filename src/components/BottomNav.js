import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { theme } from '../styles/theme'; // <-- IMPORT DO TEMA

const BottomNav = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'timeline', icon: '📅', label: 'Por Data' },
    { id: 'heavy', icon: '⚖️', label: 'Tamanho' },
    { id: 'smart', icon: '📂', label: 'Álbuns' } 
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity 
            key={tab.id} 
            style={styles.tab} 
            onPress={() => onChangeTab(tab.id)}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.background,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 20, 
  },
  tab: { alignItems: 'center', flex: 1 },
  icon: { fontSize: 24, marginBottom: 4, opacity: 0.5 },
  iconActive: { opacity: 1 },
  label: { fontSize: 12, color: theme.colors.inactive, fontWeight: '600' },
  labelActive: { color: theme.colors.primary, fontWeight: 'bold' },
});

export default BottomNav;