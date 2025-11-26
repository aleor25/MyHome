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
    backgroundColor: '#F5F5F5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333'
  },
  listContainer: {
    padding: 16
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  propertyImage: {
    width: '100%',
    height: 200
  },
  cardContent: {
    padding: 16
  },
  propertyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12
  },
  datesContainer: {
    marginBottom: 12
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 4
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  statusContainer: {
    marginBottom: 12
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusConfirmed: {
    backgroundColor: '#FFF9C4'
  },
  statusCheckedIn: {
    backgroundColor: '#C8E6C9'
  },
  statusCompleted: {
    backgroundColor: '#E0E0E0'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  actionsContainer: {
    marginTop: 8
  },
  checkInButton: {
    flexDirection: 'row',
    backgroundColor: '#0288D1',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  checkInButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  checkOutButton: {
    flexDirection: 'row',
    backgroundColor: '#00C853',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  checkOutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0288D1'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  }
});
