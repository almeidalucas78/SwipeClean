import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, FlatList, Image } from 'react-native';

// --- NOVOS IMPORTS DO DESIGN SYSTEM ---
import { globalStyles } from '../styles/globalStyles';
import { theme } from '../styles/theme';

import { usePhotos } from '../hooks/usePhotos';
import { useSwipeLogic } from '../hooks/useSwipeLogic';
import ConfirmationScreen from '../components/ConfirmationScreen';
import ScreenHeader from '../components/ScreenHeader';
import SwipeDeck from '../components/SwipeDeck';
import EmptyState from '../components/EmptyState';

export default function SmartCleanScreen() {
  const { albums, getPhotos, permissionStatus, deletePhotosFromGallery, getPhotosFromAlbum } = usePhotos();
  
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [loadingAlbum, setLoadingAlbum] = useState(false);

  const {
    currentIndex, markedForDeletion, showConfirmation, setShowConfirmation, isDeleting,
    handleKeep, handleDeleteMark, handleRemoveFromDeletionList, confirmDeletion, resetSwipeState
  } = useSwipeLogic(deletePhotosFromGallery, () => {
    setSelectedAlbum(null);
    setAlbumPhotos([]);
  });

  useEffect(() => {
    getPhotos();
  }, []);

  const handleOpenAlbum = async (album) => {
    setLoadingAlbum(true);
    setSelectedAlbum(album);
    const photos = await getPhotosFromAlbum(album.id);
    setAlbumPhotos(photos.reverse()); 
    resetSwipeState();
    setLoadingAlbum(false);
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

  // --- MODO SWIPE (ÁLBUM ABERTO) ---
  if (selectedAlbum) {
    const totalPhotos = albumPhotos.length;
    const photosRemaining = totalPhotos - currentIndex;
    const markedCount = markedForDeletion.length;
    const isButtonActive = markedCount > 0;
    
    return (
      <View style={globalStyles.container}>
        <ScreenHeader
          title={`📂 ${selectedAlbum.title}`}
          subtitle={`${photosRemaining} fotos para revisar`}
          onBack={() => {
            setSelectedAlbum(null);
            setAlbumPhotos([]);
            resetSwipeState();
          }}
        />

        <View style={globalStyles.content}>
          {loadingAlbum ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : photosRemaining > 0 ? (
            <View style={globalStyles.cardArea}>
              <SwipeDeck
                photos={albumPhotos}
                currentIndex={currentIndex}
                onSwipeLeft={handleDeleteMark}
                onSwipeRight={handleKeep}
                showActions={true} 
                containerStyle={globalStyles.deckContainer}
              />
            </View>
          ) : (
            <View style={globalStyles.center}>
              <EmptyState title="Álbum revisado!" />
              <TouchableOpacity 
                style={styles.finishMonthButton} 
                onPress={() => { setSelectedAlbum(null); setAlbumPhotos([]); }}
              >
                <Text style={styles.finishMonthButtonText}>← Voltar aos Álbuns</Text>
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

  // --- MODO GRADE DE ÁLBUNS ---
  const renderAlbumCard = ({ item }) => (
    <TouchableOpacity style={styles.albumCard} onPress={() => handleOpenAlbum(item)}>
      <Image source={{ uri: item.coverUri }} style={styles.albumCover} />
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.albumCount}>{item.assetCount} fotos</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <ScreenHeader title="✨ Por Álbum" subtitle="Organize por categorias" />

      {permissionStatus !== 'granted' ? (
        <View style={globalStyles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow} 
          renderItem={renderAlbumCard}
          ListEmptyComponent={<EmptyState title="Nenhum álbum encontrado" icon="📂" />}
        />
      )}
    </View>
  );
}

// OLHA A LIMPEZA: O CÓDIGO CAIU PELA METADE!
const styles = StyleSheet.create({
  // Estilos da Grade de Álbuns
  gridContainer: { padding: theme.spacing.m, paddingBottom: 40 },
  gridRow: { justifyContent: 'space-between' },
  albumCard: {
    width: '48%', 
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.light, // Sombras padronizadas vindas do nosso tema
  },
  albumCover: {
    width: '100%',
    height: 140, 
    backgroundColor: theme.colors.surface,
  },
  albumInfo: {
    padding: 12,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  albumCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  finishMonthButton: { 
    marginTop: theme.spacing.xl, 
    backgroundColor: theme.colors.primary, 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: theme.borderRadius.lg 
  },
  finishMonthButtonText: { color: theme.colors.background, fontSize: 16, fontWeight: 'bold' },
});