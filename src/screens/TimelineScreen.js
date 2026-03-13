import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
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

  // --- SEGURANÇA: LÓGICA DE CARREGAMENTO COM AUTOCURA ---
  useEffect(() => {
    const loadReviewedMonths = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@SwipeClean:reviewedMonths');
        if (savedData !== null) {
          try {
            // Tenta transformar o texto em Array
            setReviewedMonths(JSON.parse(savedData));
          } catch (parseError) {
            // Se os dados estiverem corrompidos, limpa o disco para não travar o app
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

  // --- LÓGICA DE SALVAMENTO (GRAVA NO DISCO) ---
  const handleFinishMonth = async () => {
    if (selectedGroup && !reviewedMonths.includes(selectedGroup.id)) {
      const updatedMonthsList = [...reviewedMonths, selectedGroup.id];
      
      setReviewedMonths(updatedMonthsList); // Atualiza a tela
      
      try {
        // Grava no disco permanentemente
        await AsyncStorage.setItem('@SwipeClean:reviewedMonths', JSON.stringify(updatedMonthsList));
      } catch (error) {
        console.error("Erro ao salvar dados no disco:", error);
      }
    }
    setSelectedGroup(null);
    resetSwipeState();
  };

  // --- DRY APLICADO: O LOADING AGORA FICA DENTRO DO CONFIRMATION SCREEN ---
  if (showConfirmation) {
    return (
      <ConfirmationScreen
        photosToDelete={markedForDeletion}
        isDeleting={isDeleting} // <-- SÓ PASSAR A PROP AQUI
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
      <View style={styles.container}>
        <ScreenHeader
          title="SwipeClean 📸"
          subtitle={`${photosRemaining} fotos para revisar`}
          onBack={() => {
            setSelectedGroup(null);
            resetSwipeState();
          }}
        />

        <View style={styles.content}>
          {photosRemaining > 0 ? (
            <View style={styles.cardArea}>
              <SwipeDeck
                photos={photosToSwipe}
                currentIndex={currentIndex}
                onSwipeLeft={handleDeleteMark}
                onSwipeRight={handleKeep}
                showActions={true} 
                containerStyle={styles.deckContainer}
              />
            </View>
          ) : (
            <View style={styles.center}>
              <EmptyState title="Mês revisado!" />
              <TouchableOpacity style={styles.finishMonthButton} onPress={handleFinishMonth}>
                <Text style={styles.finishMonthButtonText}>✅ Concluir Revisão do Mês</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

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
    <View style={styles.container}>
      <ScreenHeader title="📅 Limpeza por Data" subtitle="Escolha um mês para revisar" />

      {permissionStatus !== 'granted' ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>
      ) : (
        <FlatList
          data={pendingMonths}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  deckContainer: { width: '90%', height: '75%', position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
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

  finishMonthButton: { marginTop: 30, backgroundColor: '#34C759', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 24, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  finishMonthButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  reviewedSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 20 },
  reviewedToggle: { paddingVertical: 10, alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 15 },
  reviewedToggleText: { color: '#666', fontSize: 14, fontWeight: 'bold' },
  reviewedList: { opacity: 0.8 }, 
  monthCardReviewed: { backgroundColor: '#fdfdfd', borderColor: '#e0e0e0', borderStyle: 'dashed' }, 
  monthTitleReviewed: { color: '#999' },
  monthBadgeReviewed: { backgroundColor: '#f0f0f0' },
  monthBadgeTextReviewed: { color: '#999' },
});