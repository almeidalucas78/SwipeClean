import { useState } from 'react';
import { Alert, Linking } from 'react-native'; // <-- Adicionamos o Linking para ajudar o usuário
import * as MediaLibrary from 'expo-media-library';

export const usePhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [groupedPhotos, setGroupedPhotos] = useState([]); 
  const [status, setStatus] = useState('undetermined');

  const groupPhotosByMonth = (assets) => {
    const groups = {};

    assets.forEach(photo => {
      try {
        let timestamp = photo.creationTime || photo.modificationTime || Date.now();

        if (timestamp < 1000000000000) {
          timestamp = timestamp * 1000;
        }

        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) return;

        const month = date.getMonth();
        const year = date.getFullYear();
        const key = `${year}-${month}`;

        if (!groups[key]) {
          const monthName = date.toLocaleString('pt-BR', { month: 'long' });
          const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

          groups[key] = {
            id: key,
            title: `${capitalizedMonth} de ${year}`,
            photos: []
          };
        }
        groups[key].photos.push(photo);
      } catch (err) {
        console.log("Erro ao processar foto:", photo.id, err);
      }
    });

    return Object.values(groups).sort((a, b) => {
      const [yearA, monthA] = a.id.split('-').map(Number);
      const [yearB, monthB] = b.id.split('-').map(Number);
      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
  };

  const getPhotos = async () => {
    try {
      let permission = await MediaLibrary.getPermissionsAsync(false, ['photo']);

      if (permission.status !== 'granted' && permission.canAskAgain) {
        permission = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
      }

      setStatus(permission.status);

      // --- PASSO 3 APLICADO: SEGURANÇA DE PERMISSÕES (SILENT FAIL) ---
      if (permission.status !== 'granted') {
        if (!permission.canAskAgain) {
          // Se o usuário negou e marcou "Não perguntar novamente"
          Alert.alert(
            "Permissão Necessária", 
            "O SwipeClean precisa de acesso à galeria para te ajudar a limpar espaço. Por favor, libere a permissão nas Configurações do seu aparelho.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Abrir Configurações", onPress: () => Linking.openSettings() } // <-- Atalho prático!
            ]
          );
        }
        return; // Para a execução para não quebrar o app
      }

      const { assets } = await MediaLibrary.getAssetsAsync({
        first: 1500, 
        sortBy: ['creationTime'],
        mediaType: ['photo'],
      });

      setPhotos(assets);
      setGroupedPhotos(groupPhotosByMonth(assets));

    } catch (error) {
      Alert.alert("Erro ao buscar fotos", String(error.message || error));
    }
  };

  const deletePhotosFromGallery = async (photoIds) => {
    try {
      if (photoIds.length === 0) return true;

      const success = await MediaLibrary.deleteAssetsAsync(photoIds);

      if (success) {
        setPhotos((prevPhotos) => {
          const updatedPhotos = prevPhotos.filter(photo => !photoIds.includes(photo.id));
          setGroupedPhotos(groupPhotosByMonth(updatedPhotos));
          return updatedPhotos;
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const heavyPhotos = [...photos].map(photo => {
    const megapixels = (photo.width * photo.height) / 1000000;
    const estimatedMB = isNaN(megapixels) ? 0.5 : parseFloat((Math.max(0.5, megapixels * 0.5)).toFixed(1));
    return { ...photo, estimatedMB };
  }).sort((a, b) => b.estimatedMB - a.estimatedMB); 

  return {
    photos,
    groupedPhotos,
    heavyPhotos,
    getPhotos,
    permissionStatus: status,
    deletePhotosFromGallery
  };
};