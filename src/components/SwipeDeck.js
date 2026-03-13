// d:\estudos\SwipeClean\src\components\SwipeDeck.js
import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhotoCard from './PhotoCard';

export default function SwipeDeck({
  photos,
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
  renderCardOverlay, // Renderiza conteúdo extra (ex: Badge de MB)
  showActions = false, // Se true, mostra os botões flutuantes (Timeline)
  containerStyle,
  cardStyle, // Estilo para o wrapper do card (ex: absolute para HeavyFiles)
}) {
  // Proteção: Se photos for undefined ou vazio, não renderiza nada para evitar erro de .slice
  if (!photos || photos.length === 0) return null;

  const swiperRef = useRef(null);
  
  // Lógica principal de UI: Pega a atual + próxima e inverte para empilhar
  const visiblePhotos = photos.slice(currentIndex, currentIndex + 2).reverse();

  return (
    <View style={[styles.container, containerStyle]}>
      {visiblePhotos.map((photo, index) => {
        const isTopCard = index === visiblePhotos.length - 1;
        
        return (
          <View 
            key={photo.id} 
            style={[styles.cardWrapper, cardStyle]}
            pointerEvents={isTopCard ? 'auto' : 'none'} // Só o cartão do topo aceita gestos
          >
            <PhotoCard
              photo={photo}
              ref={isTopCard ? swiperRef : null}
              onSwipeLeft={() => onSwipeLeft(photo)}
              onSwipeRight={onSwipeRight}
              currentIndex={currentIndex}
              totalPhotos={photos.length}
            >
              {/* Render prop para injetar conteúdo customizado (Badge de MB) */}
              {renderCardOverlay && renderCardOverlay(photo)}
            </PhotoCard>
          </View>
        );
      })}

      {/* Botões Flutuantes (Opcionais) */}
      {showActions && (
        <View style={styles.floatingButtonsContainer}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => swiperRef.current?.swipeLeft()}
          >
            <Ionicons name="close" size={36} color="#FF3B30" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => swiperRef.current?.swipeRight()}
          >
            <Ionicons name="heart-outline" size={32} color="#34C759" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    // Por padrão, centralizado. Pode ser sobrescrito para absolute via props.
    width: '100%',
    height: '100%', // Garante que o wrapper ocupe a altura do container
    alignItems: 'center',
    position: 'absolute', // Garante que as cartas fiquem uma em cima da outra
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: -32,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    zIndex: 99, // Garante que fique acima dos cards
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
});
