import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { colors } from '../assets/colors/colors';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

export const EscanearQRScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (processing || scanned) return;

    setScanned(true);
    setProcessing(true);

    try {
      // Procesar el QR code en el backend
      const response = await api.post('/reservas/procesar-qr', {
        qrData: data,
      });

      if (response.data.valido) {
        Alert.alert(
          '✓ Éxito',
          response.data.mensaje,
          [
            {
              text: 'Ver Detalles',
              onPress: () => {
                navigation.navigate('Reservas' as never);
              },
            },
            {
              text: 'Escanear Otro',
              onPress: () => {
                setScanned(false);
                setProcessing(false);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          '✗ Error',
          response.data.error || 'QR code no válido',
          [
            {
              text: 'Intentar de Nuevo',
              onPress: () => {
                setScanned(false);
                setProcessing(false);
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error al procesar QR:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Error al procesar el código QR',
        [
          {
            text: 'Intentar de Nuevo',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            },
          },
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>📷</Text>
        <Text style={styles.errorTitle}>Sin Acceso a la Cámara</Text>
        <Text style={styles.errorText}>
          Para escanear códigos QR, necesitas otorgar permisos de cámara.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
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
            <Text style={styles.instructionText}>
              Apunta la cámara al código QR
            </Text>
            <Text style={styles.subText}>
              Check-in o Check-out del huésped
            </Text>
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
            {scanned && !processing && (
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={() => {
                  setScanned(false);
                  setProcessing(false);
                }}
              >
                <Text style={styles.scanAgainText}>Escanear de Nuevo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
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
  scanAgainButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  scanAgainText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
