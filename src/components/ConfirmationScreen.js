// src/components/ConfirmationScreen.js
import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';

const ConfirmationScreen = ({ photosToDelete, onConfirm, onCancel }) => {
  const photoCount = photosToDelete.length;

  const renderPhotoItem = ({ item }) => (
    <Image source={{ uri: item.uri }} style={styles.photoPreview} />
  );

  return (
    <SafeAreaView style={styles.container}>
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
  header: { padding: 30, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22 },
  photoList: { padding: 10, alignItems: 'center' },
  photoPreview: { width: 110, height: 110, margin: 5, borderRadius: 10, backgroundColor: '#eee' },
  footer: { padding: 20, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  confirmButton: { backgroundColor: '#FF3B30', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 12 },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#eee', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 12 },
  cancelButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});

export default ConfirmationScreen;