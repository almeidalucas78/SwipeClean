import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';

// ADICIONAMOS O isDeleting AQUI
const ConfirmationScreen = ({ photosToDelete, onConfirm, onCancel, onRemovePhoto, isDeleting }) => {
  const photoCount = photosToDelete.length;

  // --- LÓGICA DE DRY: O LOADING FICA AQUI DENTRO ---
  if (isDeleting) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF3B30" />
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
      {/* ... (Todo o restante do seu código JSX continua igual) ... */}
      <View style={styles.header}>
        <Text style={styles.title}>Confirmar Exclusão 🗑️</Text>
        <Text style={styles.subtitle}>
          Você selecionou {photoCount} {photoCount === 1 ? 'foto' : 'fotos'} para apagar permanentemente da sua galeria.
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
          <Text style={styles.confirmButtonText}>Sim, Apagar Fotos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { justifyContent: 'center', alignItems: 'center' }, // Novo estilo adicionado
  loadingText: { marginTop: 20, fontSize: 16, color: '#333', fontWeight: '500' }, // Novo estilo adicionado
  // ... (mantenha todos os seus outros estilos originais aqui embaixo)
  header: { padding: 30, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22 },
  photoList: { padding: 10, alignItems: 'center' },
  thumbnailContainer: { margin: 5, position: 'relative' },
  photoPreview: { width: 110, height: 110, borderRadius: 10, backgroundColor: '#eee' },
  removeIconContainer: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255, 59, 48, 0.95)', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2 },
  removeIconText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  footer: { padding: 20, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  confirmButton: { backgroundColor: '#FF3B30', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 12 },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#eee', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 12 },
  cancelButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});

export default ConfirmationScreen;