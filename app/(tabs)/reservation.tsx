import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function ReservasScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Reservas' }} />
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
