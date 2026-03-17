import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';

// --- NOVOS IMPORTS DO DESIGN SYSTEM ---
import { globalStyles } from '../styles/globalStyles';
import { theme } from '../styles/theme';

import { usePhotos } from '../hooks/usePhotos';
import { useSwipeLogic } from '../hooks/useSwipeLogic'; 
import ConfirmationScreen from '../components/ConfirmationScreen';
import ScreenHeader from '../components/ScreenHeader';
import ScoreBoard from '../components/ScoreBoard';
import SwipeDeck from '../components/SwipeDeck';
import EmptyState from '../components/EmptyState';

export default function HeavyFilesScreen() {
  const { heavyPhotos, permissionStatus, deletePhotosFromGallery, getPhotos } = usePhotos();

  const {
    currentIndex, markedForDeletion, showConfirmation, setShowConfirmation, isDeleting,
    handleKeep, handleDeleteMark, handleRemoveFromDeletionList, confirmDeletion
  } = useSwipeLogic(deletePhotosFromGallery);

  useEffect(() => {
    getPhotos();
  }, []);

  const spaceToSave = markedForDeletion.reduce((total, photo) => total + photo.estimatedMB, 0).toFixed(1);
  const photosRemaining = heavyPhotos.length - currentIndex;
  const markedCount = markedForDeletion.length;
  const isButtonActive = markedCount > 0;

  if (showConfirmation) {
    return (
      <ConfirmationScreen
        photosToDelete={markedForDeletion}
        isDeleting={isDeleting} 
        onConfirm={() => confirmDeletion(`Libertaste ${spaceToSave} MB de espaço.`)}
        onCancel={() => setShowConfirmation(false)}
        onRemovePhoto={handleRemoveFromDeletionList}
      />
    );
  }

  return (
    <View style={globalStyles.container}>
      <ScreenHeader title="⚖️ Pesos Pesados" subtitle="Os ficheiros que mais ocupam espaço">
        <ScoreBoard value={spaceToSave} />
      </ScreenHeader>

      <View style={globalStyles.content}>
        {permissionStatus !== 'granted' ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : photosRemaining > 0 ? (
          <View style={globalStyles.cardArea}>
            <SwipeDeck
              photos={heavyPhotos}
              currentIndex={currentIndex}
              onSwipeLeft={handleDeleteMark}
              onSwipeRight={handleKeep}
              showActions={true} 
              containerStyle={globalStyles.deckContainer}
              renderCardOverlay={(photo) => (
                <View style={styles.sizeBadge}>
                  <Text style={styles.sizeBadgeText}>{photo.estimatedMB} MB</Text>
                </View>
              )}
            />
          </View>
        ) : (
          <EmptyState icon="🏆" title="Ficheiros pesados revistos!" />
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
            🗑️ Limpar {spaceToSave} MB
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// OLHA A LIMPEZA! APENAS O QUE É EXCLUSIVO DESTA TELA FICA AQUI.
const styles = StyleSheet.create({
  sizeBadge: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  sizeBadgeText: { 
    color: theme.colors.background, 
    fontWeight: 'bold', 
    fontSize: 14 
  },
});