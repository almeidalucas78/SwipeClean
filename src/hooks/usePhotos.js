import { useState } from 'react';
import { Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export const usePhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [groupedPhotos, setGroupedPhotos] = useState([]); // NOVO ESTADO
  const [status, setStatus] = useState('undetermined');

  // --- NOVA FUNÇÃO: Agrupar por Mês e Ano ---
  const groupPhotosByMonth = (assets) => {
    const groups = {};

    assets.forEach(photo => {
      // 1. Fallback: Se não tiver data de criação, tenta a de modificação. Se não tiver nenhuma, usa a data de hoje.
      let timestamp = photo.creationTime || photo.modificationTime || Date.now();

      // 2. Trava de segurança para milissegundos: 
      // Se o número for menor que 1 trilhão, significa que está em segundos (comum em algumas APIs nativas).
      // Então multiplicamos por 1000 para converter para milissegundos, que é o que o Javascript exige.
      if (timestamp < 1000000000000) {
        timestamp = timestamp * 1000;
      }

      const date = new Date(timestamp);
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

      if (permission.status !== 'granted') return;

      const { assets } = await MediaLibrary.getAssetsAsync({
        first: 300, // Aumentei para 300 para termos volume para agrupar em vários meses
        sortBy: ['creationTime'],
        mediaType: ['photo'],
      });

      setPhotos(assets);
      setGroupedPhotos(groupPhotosByMonth(assets)); // Salva os grupos

    } catch (error) {
      Alert.alert("Erro ao buscar fotos", String(error.message || error));
    }
  };

  const deletePhotosFromGallery = async (photoIds) => {
    try {
      if (photoIds.length === 0) return true;

      const success = await MediaLibrary.deleteAssetsAsync(photoIds);

      if (success) {
        // Atualiza a lista geral e regera os grupos para a tela atualizar
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

  // --- NOVA LÓGICA: Calcular os ficheiros mais pesados ---
  const heavyPhotos = [...photos].map(photo => {
    // Estimativa: 1 Megapixel ~= 0.5 MB (num JPEG normal)
    const megapixels = (photo.width * photo.height) / 1000000;
    const estimatedMB = parseFloat((Math.max(0.5, megapixels * 0.5)).toFixed(1));
    return { ...photo, estimatedMB };
  }).sort((a, b) => b.estimatedMB - a.estimatedMB); // Ordena do maior para o menor

  return {
    photos,
    groupedPhotos,
    heavyPhotos,
    getPhotos,
    permissionStatus: status,
    deletePhotosFromGallery
  };
};
