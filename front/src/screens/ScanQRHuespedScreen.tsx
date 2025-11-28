import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../assets/colors/colors';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

export const ScanQRHuespedScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);
  const [reservaId, setReservaId] = useState<number | null>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (processing || scanned) return;

    setScanned(true);
    setProcessing(true);

    try {
      const parsedData = JSON.parse(data);
      setQrData(parsedData);

      // Obtener reservas del huésped para esta propiedad
      const reservasResponse = await api.get('/reservas/mis-reservas');
      const reservas = reservasResponse.data.reservas || [];

      // Buscar reserva activa para esta propiedad
      const reservaActiva = reservas.find(
        (r: any) =>
          r.propiedad_id === parsedData.propiedadId &&
          (r.estado === 'confirmada' || r.estado === 'check-in')
      );

      if (!reservaActiva) {
        Alert.alert(
          'Error',
          'No tienes una reserva activa para esta propiedad',
          [{ text: 'OK', onPress: () => { setScanned(false); setProcessing(false); } }]
        );
        return;
      }

      setReservaId(reservaActiva.id);

      if (reservaActiva.estado === 'confirmada') {
        // Mostrar modal para check-in
        setShowCheckinModal(true);
        setProcessing(false);
      } else if (reservaActiva.estado === 'check-in') {
        // Mostrar modal para check-out
        setShowCheckoutModal(true);
        setProcessing(false);
      }
    } catch (error: any) {
      console.error('Error al procesar QR:', error);
      Alert.alert(
        'Error',
        'QR code inválido',
        [{ text: 'OK', onPress: () => { setScanned(false); setProcessing(false); } }]
      );
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      setFotos([...fotos, result.assets[0].uri]);
    }
  };

  const handleCheckin = async () => {
    if (fotos.length < 2) {
      Alert.alert('Error', 'Debes tomar al menos 2 fotos del estado de la propiedad');
      return;
    }

    try {
      setProcessing(true);
      await api.post('/reservas/checkin', {
        reservaId,
        fotos: fotos,
      });

      Alert.alert(
        'Éxito',
        'Check-in realizado exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowCheckinModal(false);
              setFotos([]);
              setScanned(false);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al procesar check-in');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (fotos.length < 2) {
      Alert.alert('Error', 'Debes tomar al menos 2 fotos del estado de la propiedad');
      return;
    }

    try {
      setProcessing(true);
      await api.post('/reservas/checkout', {
        reservaId,
        fotos: fotos,
      });

      Alert.alert(
        'Éxito',
        'Check-out realizado. Reserva completada',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowCheckoutModal(false);
              setFotos([]);
              setScanned(false);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al procesar check-out');
    } finally {
      setProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Solicitando permisos...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>📷</Text>
        <Text style={styles.errorTitle}>Sin Acceso a la Cámara</Text>
        <Text style={styles.errorText}>
          Necesitas otorgar permisos de cámara para escanear el QR de la propiedad.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <Text style={styles.instructionText}>Escanea el QR de la propiedad</Text>
            <Text style={styles.subText}>Para check-in o check-out</Text>
          </View>

          <View style={styles.middleOverlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <View style={styles.bottomOverlay}>
            {processing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.processingText}>Procesando...</Text>
              </View>
            )}
          </View>
        </View>
      </CameraView>

      {/* Modal Check-in */}
      <Modal visible={showCheckinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📍 Check-in</Text>
            <Text style={styles.modalSubtitle}>Toma 2 fotos del estado de la propiedad</Text>

            <ScrollView horizontal style={styles.photosContainer}>
              {fotos.map((foto, index) => (
                <Image key={index} source={{ uri: foto }} style={styles.photoPreview} />
              ))}
            </ScrollView>

            <Text style={styles.photoCount}>{fotos.length}/2 fotos</Text>

            <TouchableOpacity style={styles.photoButton} onPress={pickImage} disabled={fotos.length >= 2}>
              <Text style={styles.photoButtonText}>📷 Tomar Foto</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCheckinModal(false);
                  setFotos([]);
                  setScanned(false);
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCheckin}
                disabled={fotos.length < 2 || processing}
              >
                <Text style={styles.buttonText}>
                  {processing ? 'Procesando...' : 'Confirmar Check-in'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Check-out */}
      <Modal visible={showCheckoutModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🚪 Check-out</Text>
            <Text style={styles.modalSubtitle}>Toma 2 fotos del estado de la propiedad al salir</Text>

            <ScrollView horizontal style={styles.photosContainer}>
              {fotos.map((foto, index) => (
                <Image key={index} source={{ uri: foto }} style={styles.photoPreview} />
              ))}
            </ScrollView>

            <Text style={styles.photoCount}>{fotos.length}/2 fotos</Text>

            <TouchableOpacity style={styles.photoButton} onPress={pickImage} disabled={fotos.length >= 2}>
              <Text style={styles.photoButtonText}>📷 Tomar Foto</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCheckoutModal(false);
                  setFotos([]);
                  setScanned(false);
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCheckout}
                disabled={fotos.length < 2 || processing}
              >
                <Text style={styles.buttonText}>
                  {processing ? 'Procesando...' : 'Confirmar Check-out'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textLight,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
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
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  middleOverlay: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 12,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  bottomOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  processingText: {
    color: colors.white,
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  photosContainer: {
    marginBottom: 15,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
  photoCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  photoButton: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.textLight,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
});
