import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, Dimensions, Image, Animated, PanResponder, View, Text } from 'react-native';

const { width } = Dimensions.get('window');

const PhotoCard = forwardRef(({ photo, onSwipeLeft, onSwipeRight, currentIndex, totalPhotos, children }, ref) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? width + 100 : -width - 100;
    Animated.timing(pan, {
      toValue: { x, y: 0 },
      duration: 250, 
      useNativeDriver: false,
    }).start(() => {
      if (direction === 'right') onSwipeRight();
      else onSwipeLeft();
    });
  };

  useImperativeHandle(ref, () => ({
    swipeLeft: () => forceSwipe('left'),
    swipeRight: () => forceSwipe('right')
  }));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x }], 
        { useNativeDriver: false } 
      ),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > 120) {
          Animated.spring(pan, {
            toValue: { x: width + 100, y: 0 },
            useNativeDriver: false,
          }).start(() => onSwipeRight());
        } else if (gesture.dx < -120) {
          Animated.spring(pan, {
            toValue: { x: -width - 100, y: 0 },
            useNativeDriver: false,
          }).start(() => onSwipeLeft());
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, width / 2],
    outputRange: ['-10deg', '10deg'],
    extrapolate: 'clamp'
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        {
          transform: [
            { translateX: pan.x },
            { rotate: rotate }
          ]
        }
      ]}
    >
      <Image source={{ uri: photo.uri }} style={styles.image} />
      
      {/* Renderiza conteúdo extra passado pelo pai (Ex: Badge de MB) */}
      {children}

      {/* Overlay apenas com o contador agora */}
      <View style={styles.overlay}>
        <Text style={styles.photoCount}>{currentIndex + 1} de {totalPhotos}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24, 
    backgroundColor: '#fff',
    // position: 'absolute', // Removido: O SwipeDeck controla o empilhamento agora
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.2)', 
  },
  photoCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default PhotoCard;