import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import api from '../services/api';
import { colors } from '../assets/colors/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export const FavoritosScreen = () => {
  const navigation = useNavigation();
  const [favoritos, setFavoritos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchFavoritos();
    }, [])
  );

  const fetchFavoritos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/favoritos/mis-favoritos');
      setFavoritos(response.data.favoritos || []);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propiedadId: number) => {
    try {
      await api.post('/favoritos/toggle', { propiedadId });
      // Actualizar lista
      setFavoritos(favoritos.filter(f => f.id !== propiedadId));
      //Alert.alert('Éxito', 'Eliminado de favoritos');
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo eliminar de favoritos');
    }
  };

  const renderFavorito = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.favoritoCard}
      onPress={() =>
        navigation.navigate('Buscar' as never, {
          screen: 'DetallePropiedad',
          params: { propiedadId: item.id },
        } as never)
      }
    >
      {item.foto_exterior ? (
  <Image
    source={{ uri: `http://192.168.0.103:5000${item.foto_exterior}` }}
    style={styles.image}
    resizeMode="cover"
  />
) : (
  <View style={styles.imagePlaceholder}>
    <Text style={styles.imagePlaceholderText}>📸 Sin foto</Text>
  </View>
)}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.zona}>📍 {item.zona}</Text>
          </View>
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => handleRemoveFavorite(item.id)}
          >
            <Text style={styles.heartIcon}>❤️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.descripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>

        <View style={styles.details}>
          <Text style={styles.detailText}>🛏️ {item.cantidad_habitaciones} hab</Text>
          <Text style={styles.detailText}>👥 {item.cantidad_huespedes} huéspedes</Text>
          {parseFloat(item.calificacion_promedio) > 0 && (
            <Text style={styles.detailText}>
              ⭐ {parseFloat(item.calificacion_promedio).toFixed(1)} ({item.total_resenas})
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.precio}>${item.precio_noche}</Text>
          <Text style={styles.precioLabel}>por noche</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (favoritos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💔</Text>
        <Text style={styles.emptyTitle}>Sin Favoritos</Text>
        <Text style={styles.emptyText}>
          Aún no has agregado propiedades a favoritos
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Buscar' as never)}
        >
          <Text style={styles.buttonText}>Buscar Propiedades</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoritos}
        renderItem={renderFavorito}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchFavoritos}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
    gap: 15,
  },
  favoritoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  zona: {
    fontSize: 13,
    color: colors.textLight,
  },
  heartButton: {
    padding: 5,
  },
  heartIcon: {
    fontSize: 24,
  },
  descripcion: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 18,
  },
  details: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: colors.textLight,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  precio: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  precioLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  imagePlaceholder: {
  width: '100%',
  height: 200,
  backgroundColor: colors.background,
  justifyContent: 'center',
  alignItems: 'center',
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
},
imagePlaceholderText: {
  fontSize: 14,
  color: colors.textLight,
},

});
