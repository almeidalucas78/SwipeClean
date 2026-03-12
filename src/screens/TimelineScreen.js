import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePhotos } from '../hooks/usePhotos';
import PhotoCard from '../components/PhotoCard';
import ConfirmationScreen from '../components/ConfirmationScreen';

export default function TimelineScreen() {
  const { groupedPhotos, getPhotos, permissionStatus, deletePhotosFromGallery } = usePhotos();

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [markedForDeletion, setMarkedForDeletion] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const swiperRef = useRef(null);

  useEffect(() => {
    getPhotos();
  }, []);

  const nextPhoto = () => setCurrentIndex((prev) => prev + 1);
  const handleKeep = () => nextPhoto();

  const handleDeleteMark = (photo) => {
    setMarkedForDeletion((prev) => {
      if (!prev.find(p => p.id === photo.id)) return [...prev, photo];
      return prev;
    });
    nextPhoto();
  };

  const confirmDeletion = async () => {
    const idsToDelete = markedForDeletion.map(photo => photo.id);
    setIsDeleting(true);
    const success = await deletePhotosFromGallery(idsToDelete);
    setIsDeleting(false);

    if (success) {
      Alert.alert("Sucesso! 🎉", `${idsToDelete.length} fotos apagadas.`);
      setMarkedForDeletion([]);
      setShowConfirmation(false);
      setSelectedGroup(null);
      setCurrentIndex(0);
    }
  };

  if (showConfirmation) {
    if (isDeleting) {
      return (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={{ marginTop: 20 }}>Apagando fotos da galeria...</Text>
        </View>
      );
    }
    return (
      <ConfirmationScreen
        photosToDelete={markedForDeletion}
        onConfirm={confirmDeletion}
        onCancel={() => setShowConfirmation(false)}
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

    const visiblePhotos = photosToSwipe.slice(currentIndex, currentIndex + 2).reverse();

    return (
      <View style={styles.container}>
        {/* Header Super Clean */}
        <View style={styles.headerSwipe}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            setSelectedGroup(null);
            setCurrentIndex(0);
            setMarkedForDeletion([]);
          }}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.titleClean}>SwipeClean 📸</Text>
            <Text style={styles.subtitleClean}>{photosRemaining} fotos para revisar</Text>
          </View>
        </View>

        {/* Área Centralizada */}
        <View style={styles.content}>
          {photosRemaining > 0 ? (
            <View style={styles.cardArea}>

              {/* CAIXA DO BARALHO (Deck) - Garante que os botões grudem na foto */}
              <View style={styles.deckContainer}>

                {visiblePhotos.map((photo, index) => {
                  const isTopCard = index === visiblePhotos.length - 1;
                  return (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      currentIndex={currentIndex}
                      totalPhotos={totalPhotos}
                      ref={isTopCard ? swiperRef : null}
                      onSwipeLeft={() => handleDeleteMark(photo)}
                      onSwipeRight={handleKeep}
                    />
                  );
                })}

                {/* Botões Flutuantes colados no fundo da caixa do baralho */}
                {/* Botões Flutuantes colados no fundo da caixa do baralho */}
                <View style={styles.floatingButtonsContainer}>
                  <TouchableOpacity
                    style={styles.circleButton}
                    onPress={() => swiperRef.current?.swipeLeft()}
                  >
                    {/* Ícone de X */}
                    <Ionicons name="close" size={36} color="#FF3B30" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.circleButton}
                    onPress={() => swiperRef.current?.swipeRight()}
                  >
                    {/* Ícone de Coração Vazado (outline) */}
                    <Ionicons name="heart-outline" size={32} color="#34C759" />
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={{ fontSize: 40, marginBottom: 20 }}>✅</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Mês revisado!</Text>
            </View>
          )}
        </View>

        {/* Rodapé com Botão Inteligente */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.reviewButton, isButtonActive ? styles.reviewButtonActive : styles.reviewButtonInactive]}
            disabled={!isButtonActive}
            onPress={() => setShowConfirmation(true)}
          >
            <Text style={[styles.reviewButtonText, !isButtonActive && styles.reviewButtonTextInactive]}>
              🗑️ Revisar e Apagar ({markedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- MODO LISTA DE MESES (Padrão) ---
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titleClean}>📅 Limpeza por Data</Text>
        <Text style={styles.subtitleClean}>Escolha um mês para revisar</Text>
      </View>

      {permissionStatus !== 'granted' ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>
      ) : (
        <FlatList
          data={groupedPhotos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.monthCard}
              onPress={() => {
                setSelectedGroup(item);
                setCurrentIndex(0);
                setMarkedForDeletion([]);
              }}
            >
              <Text style={styles.monthTitle}>{item.title}</Text>
              <View style={styles.monthBadge}>
                <Text style={styles.monthBadgeText}>{item.photos.length} fotos</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { padding: 30, paddingTop: 60, backgroundColor: '#fff' },
  headerSwipe: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 30, backgroundColor: '#fff' },
  backButton: { marginRight: 20 },
  backButtonText: { color: '#666', fontSize: 14, fontWeight: 'bold' },
  titleClean: { fontSize: 24, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  subtitleClean: { fontSize: 14, color: '#888', marginTop: 4 },

  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // A área que engloba tudo
  cardArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },

  // A "Caixa" invisível que define o tamanho do card e ancora os botões
  deckContainer: {
    width: '90%',
    height: '75%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20 // Garante um distanciamento do rodapé
  },

  // Botões agora ficam presos à borda inferior do deckContainer
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: -32, // Metade do botão pra dentro, metade pra fora
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginHorizontal: 15,
  },

  footer: { padding: 20, paddingBottom: 30, backgroundColor: '#fff' },
  reviewButton: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  reviewButtonInactive: { backgroundColor: '#F0F0F0' },
  reviewButtonActive: { backgroundColor: '#FF3B30' },
  reviewButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  reviewButtonTextInactive: { color: '#a0a0a0' },

  monthCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  monthTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  monthBadge: { backgroundColor: '#f8f9fa', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  monthBadgeText: { color: '#666', fontWeight: 'bold', fontSize: 14 },
});