import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// --- NOVOS IMPORTS DO DESIGN SYSTEM ---
import { globalStyles } from '../styles/globalStyles';
import { theme } from '../styles/theme';

import { usePhotos } from '../hooks/usePhotos';
import { useSwipeLogic } from '../hooks/useSwipeLogic';
import ConfirmationScreen from '../components/ConfirmationScreen';
import ScreenHeader from '../components/ScreenHeader';
import SwipeDeck from '../components/SwipeDeck';
import EmptyState from '../components/EmptyState';

export default function TimelineScreen() {
  const { groupedPhotos, getPhotos, permissionStatus, deletePhotosFromGallery } = usePhotos();
  
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [reviewedMonths, setReviewedMonths] = useState([]); 
  const [showReviewed, setShowReviewed] = useState(false); 

  const {
    currentIndex, markedForDeletion, showConfirmation, setShowConfirmation, isDeleting,
    handleKeep, handleDeleteMark, handleRemoveFromDeletionList, confirmDeletion, resetSwipeState
  } = useSwipeLogic(deletePhotosFromGallery, () => setSelectedGroup(null));

  useEffect(() => {
    const loadReviewedMonths = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@SwipeClean:reviewedMonths');
        if (savedData !== null) {
          try {
            setReviewedMonths(JSON.parse(savedData));
          } catch (parseError) {
            console.warn("Dados corrompidos detectados. Limpando histórico...");
            await AsyncStorage.removeItem('@SwipeClean:reviewedMonths');
          }
        }
      } catch (error) {
        console.error("Erro ao ler o disco:", error);
      }
    };

    loadReviewedMonths();
    getPhotos();
  }, []);

  const pendingMonths = groupedPhotos.filter(group => !reviewedMonths.includes(group.id));
  const completedMonths = groupedPhotos.filter(group => reviewedMonths.includes(group.id));

  const handleFinishMonth = async () => {
    if (selectedGroup && !reviewedMonths.includes(selectedGroup.id)) {
      const updatedMonthsList = [...reviewedMonths, selectedGroup.id];
      setReviewedMonths(updatedMonthsList); 
      try {
        await AsyncStorage.setItem('@SwipeClean:reviewedMonths', JSON.stringify(updatedMonthsList));
      } catch (error) {
        console.error("Erro ao salvar dados no disco:", error);
      }
    }
    setSelectedGroup(null);
    resetSwipeState();
  };

  if (showConfirmation) {
    return (
      <ConfirmationScreen
        photosToDelete={markedForDeletion}
        isDeleting={isDeleting} 
        onConfirm={() => confirmDeletion()}
        onCancel={() => setShowConfirmation(false)}
        onRemovePhoto={handleRemoveFromDeletionList}
      />
    );
  }

  // --- MODO SWIPE ---
  if (selectedGroup) {
    const photosToSwipe = selectedGroup.photos;
    const totalPhotos = photosToSwipe.length;
    const photosRemaining = totalPhotos - currentIndex;
    const markedCount = markedForDeletion.length;
    const isButtonActive = markedCount > 0;
    
    return (
      <View style={globalStyles.container}>
        <ScreenHeader
          title="SwipeClean 📸"
          subtitle={`${photosRemaining} fotos para revisar`}
          onBack={() => {
            setSelectedGroup(null);
            resetSwipeState();
          }}
        />

        <View style={globalStyles.content}>
          {photosRemaining > 0 ? (
            <View style={globalStyles.cardArea}>
              <SwipeDeck
                photos={photosToSwipe}
                currentIndex={currentIndex}
                onSwipeLeft={handleDeleteMark}
                onSwipeRight={handleKeep}
                showActions={true} 
                containerStyle={globalStyles.deckContainer}
              />
            </View>
          ) : (
            <View style={globalStyles.center}>
              <EmptyState title="Mês revisado!" />
              <TouchableOpacity style={globalStyles.successButton} onPress={handleFinishMonth}>
                <Text style={globalStyles.successButtonText}>✅ Concluir Revisão do Mês</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={globalStyles.footer}>
          <TouchableOpacity
            style={[
              globalStyles.reviewButton, 
              isButtonActive ? globalStyles.reviewButtonActive : globalStyles.reviewButtonInactive
            ]}
            disabled={!isButtonActive}
            onPress={() => setShowConfirmation(true)}
          >
            <Text style={[
              globalStyles.reviewButtonText, 
              !isButtonActive && globalStyles.reviewButtonTextInactive
            ]}>
              🗑️ Revisar e Apagar ({markedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderMonthCard = ({ item, isReviewed = false }) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.monthCard, isReviewed && styles.monthCardReviewed]}
      onPress={() => {
        setSelectedGroup(item);
        resetSwipeState();
      }}
    >
      <Text style={[styles.monthTitle, isReviewed && styles.monthTitleReviewed]}>{item.title}</Text>
      <View style={[styles.monthBadge, isReviewed && styles.monthBadgeReviewed]}>
        <Text style={[styles.monthBadgeText, isReviewed && styles.monthBadgeTextReviewed]}>
          {item.photos.length} fotos
        </Text>
      </View>
    </TouchableOpacity>
  );

  // --- MODO LISTA DE MESES (Padrão) ---
  return (
    <View style={globalStyles.container}>
      <ScreenHeader title="📅 Limpeza por Data" subtitle="Escolha um mês para revisar" />

      {permissionStatus !== 'granted' ? (
        <View style={globalStyles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={pendingMonths}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.l, paddingBottom: 40 }}
          renderItem={renderMonthCard}
          ListFooterComponent={
            completedMonths.length > 0 ? (
              <View style={styles.reviewedSection}>
                <TouchableOpacity 
                  style={styles.reviewedToggle} 
                  onPress={() => setShowReviewed(!showReviewed)}
                >
                  <Text style={styles.reviewedToggleText}>
                    {showReviewed ? '🔽 Ocultar' : '▶️ Mostrar'} Meses Revisados ({completedMonths.length})
                  </Text>
                </TouchableOpacity>

                {showReviewed && (
                  <View style={styles.reviewedList}>
                    {completedMonths.map(item => renderMonthCard({ item, isReviewed: true }))}
                  </View>
                )}
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

// OLHA COMO O STYLESHEET FICOU PEQUENO!
const styles = StyleSheet.create({
  // Estilos da Lista de Meses
  monthCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: theme.colors.background, 
    padding: theme.spacing.l, 
    borderRadius: theme.borderRadius.md, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: theme.colors.border 
  },
  monthTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  monthBadge: { backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full },
  monthBadgeText: { color: theme.colors.textSecondary, fontWeight: 'bold', fontSize: 14 },

  // Estilos da Gaveta de Revisados
  reviewedSection: { marginTop: theme.spacing.l, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.l },
  reviewedToggle: { paddingVertical: theme.spacing.s, alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.sm, marginBottom: theme.spacing.m },
  reviewedToggleText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: 'bold' },
  reviewedList: { opacity: 0.8 }, 
  monthCardReviewed: { backgroundColor: '#fdfdfd', borderColor: '#e0e0e0', borderStyle: 'dashed' }, 
  monthTitleReviewed: { color: '#999' },
  monthBadgeReviewed: { backgroundColor: theme.colors.inactiveBg },
  monthBadgeTextReviewed: { color: '#999' },
});