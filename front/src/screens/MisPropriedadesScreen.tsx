import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import api from '../services/api';
import { colors } from '../assets/colors/colors';

export const MisPropriedadesScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [propiedades, setPropiedades] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedQR, setSelectedQR] = React.useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchPropiedades();
    }, [])
  );

  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/propiedades/mis-propiedades');
      setPropiedades(response.data.propiedades);
    } catch (error: any) {
      console.error('Error al obtener propiedades:', error);
      Alert.alert('Error', 'No se pudieron cargar las propiedades');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = (id: number, nombre: string) => {
    Alert.alert(
      'Eliminar Propiedad',
      `¿Está seguro de que desea eliminar "${nombre}"?`,
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => deleteProperty(id),
          style: 'destructive',
        },
      ]
    );
  };

  const deleteProperty = async (id: number) => {
    try {
      console.log('Intentando eliminar propiedad con ID:', id);
      const response = await api.delete(`/propiedades/eliminar/${id}`);
      console.log('Respuesta de eliminación:', response.data);
      Alert.alert('Éxito', 'Propiedad eliminada correctamente');
      fetchPropiedades();
    } catch (error: any) {
      console.error('Error al eliminar propiedad:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar la propiedad';
      Alert.alert('Error', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderProperty = ({ item }: { item: any }) => (
    <View style={styles.propertyCard}>
      <View style={styles.propertyHeader}>
        <View style={styles.propertyTitleContainer}>
          <Text style={styles.propertyTitle}>{item.nombre}</Text>
          <Text style={styles.propertyZone}>📍 {item.zona}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.disponible ? styles.statusAvailable : styles.statusUnavailable,
          ]}
        >
          <Text style={styles.statusText}>
            {item.disponible ? '✓ Disponible' : '✗ No disponible'}
          </Text>
        </View>
      </View>

      <View style={styles.propertyDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Precio/Noche</Text>
          <Text style={styles.detailValue}>${item.precio_noche}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Habitaciones</Text>
          <Text style={styles.detailValue}>{item.cantidad_habitaciones}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Huéspedes</Text>
          <Text style={styles.detailValue}>{item.cantidad_huespedes}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Fotos</Text>
          <Text style={styles.detailValue}>{item.total_fotos}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => setSelectedQR(item.qr_code)}
        >
          <Text style={styles.buttonText}>📱 Ver QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonEdit]}
          onPress={() => navigation.navigate('EditarPropiedad', { propiedadId: item.id })}
        >
          <Text style={styles.buttonText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonDelete]}
          onPress={() => handleDeleteProperty(item.id, item.nombre)}
        >
          <Text style={styles.buttonText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Propiedades</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AgregarPropiedad')}
        >
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!selectedQR} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.qrModal}>
            <Text style={styles.qrTitle}>Código QR de la Propiedad</Text>
            <Text style={styles.qrSubtitle}>Los huéspedes deben escanear este QR para check-in/check-out</Text>
            {selectedQR && (
              <Image source={{ uri: selectedQR }} style={styles.qrImage} resizeMode="contain" />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedQR(null)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {propiedades.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>📭 Sin propiedades</Text>
          <Text style={styles.emptyText}>
            Crea tu primera propiedad para comenzar a recibir reservas
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('AgregarPropiedad')}
          >
            <Text style={styles.createButtonText}>+ Crear Primera Propiedad</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={propiedades}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.1}
          refreshing={loading}
          onRefresh={fetchPropiedades}
        />
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 15,
    gap: 15,
  },
  propertyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  propertyTitleContainer: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  propertyZone: {
    fontSize: 12,
    color: colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusAvailable: {
    backgroundColor: '#E8F5E9',
  },
  statusUnavailable: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  propertyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonEdit: {
    backgroundColor: colors.secondary,
  },
  buttonDelete: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.secondary,
  },
  buttonEdit: {
    backgroundColor: colors.primary,
  },
  buttonDelete: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModal: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  qrImage: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});