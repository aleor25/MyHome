import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

// Voy a usar las mismas rutas de importación que tenías
// en tu archivo con errores, asumiendo que estos componentes existen:
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/ui/themed-view';

/**
 * Esta es la pantalla de 'Reservas'.
 * El contenido anterior de la plantilla 'explore.tsx' ha sido eliminado 
 * para solucionar el error de crasheo.
 */
export default function ReservasScreen() {
  return (
    // Usamos ThemedView para que tome el color de fondo (menta claro)
    <ThemedView style={styles.container}>

      {/* Esto establece el título en la cabecera de la app */}
      <Stack.Screen options={{ title: 'Mis Reservas' }} />

      <ThemedText type="title">Mis Reservas</ThemedText>

      <ThemedText style={styles.subtitle}>
        Aquí se mostrará la lista de reservas pasadas y futuras.
      </ThemedText>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});
