import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { usePhotos } from '../hooks/usePhotos';
import { useSwipeLogic } from '../hooks/useSwipeLogic'; // <-- Hook aplicado
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

  // --- DRY APLICADO: O LOADING FOI REMOVIDO DAQUI E PASSADO COMO PROP ---
  if (showConfirmation) {
    return (
      <ConfirmationScreen
        photosToDelete={markedForDeletion}
        isDeleting={isDeleting} // <-- SÓ PASSAR A PROP AQUI
        onConfirm={() => confirmDeletion(`Libertaste ${spaceToSave} MB de espaço.`)}
        onCancel={() => setShowConfirmation(false)}
        onRemovePhoto={handleRemoveFromDeletionList}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="⚖️ Pesos Pesados" subtitle="Os ficheiros que mais ocupam espaço">
        <ScoreBoard value={spaceToSave} />
      </ScreenHeader>

      <View style={styles.content}>
        {permissionStatus !== 'granted' ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : photosRemaining > 0 ? (
          <View style={styles.cardArea}>
            <SwipeDeck
              photos={heavyPhotos}
              currentIndex={currentIndex}
              onSwipeLeft={handleDeleteMark}
              onSwipeRight={handleKeep}
              showActions={true} // <-- Ativa os botões de Coração e X
              containerStyle={styles.deckContainer}
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.reviewButton, isButtonActive ? styles.reviewButtonActive : styles.reviewButtonInactive]}
          disabled={!isButtonActive}
          onPress={() => setShowConfirmation(true)}
        >
          <Text style={[styles.reviewButtonText, !isButtonActive && styles.reviewButtonTextInactive]}>
            🗑️ Limpar {spaceToSave} MB
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' }, 
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  cardArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  deckContainer: {
    width: '90%',
    height: '75%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20 
  },
  sizeBadge: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sizeBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  footer: { padding: 20, paddingBottom: 30, backgroundColor: '#fff' },
  reviewButton: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  reviewButtonInactive: { backgroundColor: '#F0F0F0' },
  reviewButtonActive: { backgroundColor: '#FF3B30' },
  reviewButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  reviewButtonTextInactive: { color: '#a0a0a0' },
});