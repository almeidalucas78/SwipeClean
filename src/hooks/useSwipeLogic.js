import { useState } from 'react';
import { Alert } from 'react-native';

export const useSwipeLogic = (deleteFunction, onSuccessCallback) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [markedForDeletion, setMarkedForDeletion] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const nextPhoto = () => setCurrentIndex((prev) => prev + 1);
  const handleKeep = () => nextPhoto();

  const handleDeleteMark = (photo) => {
    setMarkedForDeletion((prev) => {
      if (!prev.find(p => p.id === photo.id)) return [...prev, photo];
      return prev;
    });
    nextPhoto();
  };

  const handleRemoveFromDeletionList = (photoId) => {
    setMarkedForDeletion((prev) => {
      const updatedList = prev.filter(photo => photo.id !== photoId);
      if (updatedList.length === 0) setShowConfirmation(false);
      return updatedList;
    });
  };

  const confirmDeletion = async (customSuccessMessage) => {
    const idsToDelete = markedForDeletion.map(photo => photo.id);
    setIsDeleting(true);
    
    // Chama a função nativa do expo-media-library
    const success = await deleteFunction(idsToDelete);
    
    setIsDeleting(false);

    if (success) {
      Alert.alert("Sucesso! 🎉", customSuccessMessage || `${idsToDelete.length} fotos apagadas.`);
      setMarkedForDeletion([]);
      setShowConfirmation(false);
      setCurrentIndex(0);
      if (onSuccessCallback) onSuccessCallback();
    } else {
      // SEGURANÇA: O Android/iOS às vezes bloqueia a exclusão ou o usuário clica em "Cancelar" no popup nativo.
      // Precisamos dar esse feedback para não parecer que o app travou.
      Alert.alert("Aviso", "A exclusão não foi concluída. Verifique as permissões do sistema.");
    }
  };

  const resetSwipeState = () => {
    setCurrentIndex(0);
    setMarkedForDeletion([]);
    setShowConfirmation(false);
  };

  return {
    currentIndex,
    markedForDeletion,
    showConfirmation,
    setShowConfirmation,
    isDeleting,
    handleKeep,
    handleDeleteMark,
    handleRemoveFromDeletionList,
    confirmDeletion,
    resetSwipeState
  };
};