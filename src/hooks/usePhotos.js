import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export const usePhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [groupedPhotos, setGroupedPhotos] = useState([]); 
  const [albums, setAlbums] = useState([]); // <-- NOVO ESTADO PARA ÁLBUNS
  const [status, setStatus] = useState('undetermined');

  const groupPhotosByMonth = (assets) => {
    const groups = {};
    assets.forEach(photo => {
      try {
        let timestamp = photo.creationTime || photo.modificationTime || Date.now();
        if (timestamp < 1000000000000) timestamp = timestamp * 1000;
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return;

        const month = date.getMonth();
        const year = date.getFullYear();
        const key = `${year}-${month}`;

        if (!groups[key]) {
          const monthName = date.toLocaleString('pt-BR', { month: 'long' });
          const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
          groups[key] = { id: key, title: `${capitalizedMonth} de ${year}`, photos: [] };
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

      if (permission.status !== 'granted') {
        if (!permission.canAskAgain) {
          Alert.alert(
            "Permissão Necessária", 
            "O SwipeClean precisa de acesso à galeria. Libere a permissão nas Configurações.",
            [{ text: "Cancelar", style: "cancel" }, { text: "Abrir Configurações", onPress: () => Linking.openSettings() }]
          );
        }
        return;
      }

      // 1. Busca as fotos principais
      const { assets } = await MediaLibrary.getAssetsAsync({
        first: 1500, 
        sortBy: ['creationTime'],
        mediaType: ['photo'],
      });

      setPhotos(assets);
      setGroupedPhotos(groupPhotosByMonth(assets));

      // 2. NOVA LÓGICA: Busca as pastas (Álbuns) e a foto de capa
      const fetchedAlbums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
      const nonEmptyAlbums = fetchedAlbums.filter(a => a.assetCount > 0);
      
      // Ordena pelos álbuns com mais fotos primeiro
      nonEmptyAlbums.sort((a, b) => b.assetCount - a.assetCount);

      // Pega a primeira foto de cada álbum para ser a capa
      const albumsWithCovers = await Promise.all(nonEmptyAlbums.map(async (album) => {
        const coverAsset = await MediaLibrary.getAssetsAsync({ album: album.id, first: 1, mediaType: ['photo'] });
        return { 
          ...album, 
          coverUri: coverAsset.assets.length > 0 ? coverAsset.assets[0].uri : null 
        };
      }));

      setAlbums(albumsWithCovers.filter(a => a.coverUri));

    } catch (error) {
      Alert.alert("Erro ao buscar fotos", String(error.message || error));
    }
  };

  // --- NOVA FUNÇÃO: Busca as fotos DE UM ÁLBUM ESPECÍFICO quando o usuário clica nele ---
  const getPhotosFromAlbum = async (albumId) => {
    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        album: albumId,
        first: 1000,
        sortBy: ['creationTime'],
        mediaType: ['photo'],
      });
      return assets;
    } catch (error) {
      console.error("Erro ao abrir álbum:", error);
      return [];
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
        // Atualizamos a contagem dos álbuns novamente
        getPhotos(); 
        return true;
      }
      return false;
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
    albums, // <-- EXPORTA OS ÁLBUNS
    getPhotos,
    getPhotosFromAlbum, // <-- EXPORTA A FUNÇÃO DE ABRIR ÁLBUM
    permissionStatus: status,
    deletePhotosFromGallery
  };
};