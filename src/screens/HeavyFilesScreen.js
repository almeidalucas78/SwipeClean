import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { usePhotos } from '../hooks/usePhotos';
import PhotoCard from '../components/PhotoCard';
import ConfirmationScreen from '../components/ConfirmationScreen';

export default function HeavyFilesScreen() {
  const { heavyPhotos, permissionStatus, deletePhotosFromGallery, getPhotos } = usePhotos();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [markedForDeletion, setMarkedForDeletion] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Busca as fotos assim que a tela é aberta
  useEffect(() => {
    getPhotos();
  }, []);

  // Calcula dinamicamente o total de MB que o utilizador vai poupar
  const spaceToSave = markedForDeletion.reduce((total, photo) => total + photo.estimatedMB, 0).toFixed(1);

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
      Alert.alert("Fantástico! 🚀", `Libertaste ${spaceToSave} MB de espaço no teu dispositivo.`);
      setMarkedForDeletion([]);
      setShowConfirmation(false);
      setCurrentIndex(0);
    }
  };

  if (showConfirmation) {
    if (isDeleting) {
      return (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={{ marginTop: 20 }}>A eliminar ficheiros pesados...</Text>
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

  const photosRemaining = heavyPhotos.length - currentIndex;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚖️ Pesos Pesados</Text>
        <Text style={styles.subtitle}>Os ficheiros que mais ocupam espaço</Text>

        {/* Painel de Gamificação */}
        <View style={styles.scoreBoard}>
          <Text style={styles.scoreText}>Espaço a libertar:</Text>
          <Text style={styles.scoreValue}>{spaceToSave} MB</Text>
        </View>
      </View>

      <View style={styles.content}>
        {permissionStatus !== 'granted' ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : photosRemaining > 0 ? (
          heavyPhotos.slice(currentIndex, currentIndex + 2).reverse().map((photo) => (
            <View key={photo.id} style={styles.cardWrapper}>

              <PhotoCard
                photo={photo}
                onSwipeLeft={() => handleDeleteMark(photo)}
                onSwipeRight={handleKeep}
              >
                {/* Agora a etiqueta fica AQUI dentro! */}
                <View style={styles.sizeBadge}>
                  <Text style={styles.sizeBadgeText}>{photo.estimatedMB} MB</Text>
                </View>
              </PhotoCard>

            </View>
          ))
        ) : (
          <View style={styles.center}>
            <Text style={{ fontSize: 40, marginBottom: 20 }}>🏆</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Ficheiros pesados revistos!</Text>
          </View>
        )}
      </View>

      {markedForDeletion.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.reviewButton} onPress={() => setShowConfirmation(true)}>
            <Text style={styles.reviewButtonText}>🗑️ Limpar {spaceToSave} MB</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  scoreBoard: { marginTop: 15, backgroundColor: '#E6F4FE', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, alignItems: 'center', width: '100%' },
  scoreText: { color: '#007AFF', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  scoreValue: { color: '#007AFF', fontSize: 24, fontWeight: '900' },

  // A área de conteúdo volta a centralizar os elementos
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // O wrapper do card volta a ser absoluto e ocupa 100% da área disponível
  cardWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: 20 // Dá uma margem para a foto não colar nos cantos
  },

  // A etiqueta de MB agora fica por cima da foto, com fundo escuro e no topo
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

  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  reviewButton: { backgroundColor: '#FF3B30', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  reviewButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});