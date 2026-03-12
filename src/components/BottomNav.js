import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView } from 'react-native';

const BottomNav = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'timeline', icon: '📅', label: 'Por Data' },
    { id: 'heavy', icon: '⚖️', label: 'Tamanho' },
    { id: 'smart', icon: '✨', label: 'Inteligente' }
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
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 20, // Espaço extra para a barrinha do iPhone/Android
  },
  tab: { alignItems: 'center', flex: 1 },
  icon: { fontSize: 24, opacity: 0.5 },
  iconActive: { opacity: 1 },
  label: { fontSize: 12, color: '#999', marginTop: 4, fontWeight: '500' },
  labelActive: { color: '#1a1a1a', fontWeight: 'bold' },
});

export default BottomNav;