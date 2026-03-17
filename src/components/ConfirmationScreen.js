import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme'; // <-- IMPORT DO TEMA
import { globalStyles } from '../styles/globalStyles';

const ConfirmationScreen = ({ photosToDelete, onConfirm, onCancel, onRemovePhoto, isDeleting }) => {
  const photoCount = photosToDelete.length;

  if (isDeleting) {
    return (
      <SafeAreaView style={[globalStyles.container, globalStyles.center]}>
        <ActivityIndicator size="large" color={theme.colors.danger} />
        <Text style={styles.loadingText}>Apagando fotos da galeria...</Text>
      </SafeAreaView>
    );
  }

  const renderPhotoItem = ({ item }) => (
    <View style={styles.thumbnailContainer}>
      <Image source={{ uri: item.uri }} style={styles.photoPreview} />
      <TouchableOpacity 
        style={styles.removeIconContainer} 
        onPress={() => onRemovePhoto(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.removeIconText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirmar Exclusão 🗑️</Text>
        <Text style={styles.subtitle}>
          Você selecionou {photoCount} {photoCount === 1 ? 'foto' : 'fotos'} para apagar permanentemente.
        </Text>
      </View>

      <FlatList
        data={photosToDelete}
        keyExtractor={(item) => item.id}
        renderItem={renderPhotoItem}
        numColumns={3}
        contentContainerStyle={styles.photoList}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.confirmButtonText}>Sim, Apagar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  loadingText: { marginTop: 20, fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  header: { padding: 30, alignItems: 'center', backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 10 },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  photoList: { padding: 10, alignItems: 'center' },
  
  thumbnailContainer: { margin: 5, position: 'relative' },
  photoPreview: { width: 110, height: 110, borderRadius: 10, backgroundColor: theme.colors.border },
  
  removeIconContainer: {
    position: 'absolute', top: 5, right: 5, 
    backgroundColor: theme.colors.danger, 
    width: 26, height: 26, borderRadius: 13, 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 2, borderColor: theme.colors.background, 
    ...theme.shadows.light
  },
  removeIconText: { color: theme.colors.background, fontSize: 12, fontWeight: '900' },
  
  footer: { padding: 20, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: theme.colors.background, borderTopWidth: 1, borderTopColor: theme.colors.border },
  confirmButton: { backgroundColor: theme.colors.danger, paddingVertical: 15, paddingHorizontal: 25, borderRadius: theme.borderRadius.sm },
  confirmButtonText: { color: theme.colors.background, fontSize: 16, fontWeight: 'bold' },
  cancelButton: { backgroundColor: theme.colors.inactiveBg, paddingVertical: 15, paddingHorizontal: 25, borderRadius: theme.borderRadius.sm },
  cancelButtonText: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold' },
});

export default ConfirmationScreen;