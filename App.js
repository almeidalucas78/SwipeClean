import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Importando a navegação e as telas
import BottomNav from './src/components/BottomNav';
import TimelineScreen from './src/screens/TimelineScreen';
import HeavyFilesScreen from './src/screens/HeavyFilesScreen';
import SmartCleanScreen from './src/screens/SmartCleanScreen';

export default function App() {
  // Estado que controla qual aba está ativa (padrão: timeline)
  const [currentTab, setCurrentTab] = useState('timeline');

  // Função simples de roteamento
  const renderScreen = () => {
    switch (currentTab) {
      case 'timeline':
        return <TimelineScreen />;
      case 'heavy':
        return <HeavyFilesScreen />;
      case 'smart':
        return <SmartCleanScreen />;
      default:
        return <TimelineScreen />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        
        {/* Área de conteúdo dinâmico */}
        <SafeAreaView style={styles.content}>
          {renderScreen()}
        </SafeAreaView>

        {/* Menu fixo no rodapé */}
        <BottomNav activeTab={currentTab} onChangeTab={setCurrentTab} />
        
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  content: { 
    flex: 1 
  }
});