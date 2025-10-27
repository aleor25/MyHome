import { Bell, Bookmark, Home, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Lista de ítems de navegación
const navItems = [
  { name: 'Inicio', icon: Home, key: 'home' },
  { name: 'Reservas', icon: Bookmark, key: 'bookings' },
  { name: 'Notificaciones', icon: Bell, key: 'notifications' },
  { name: 'Perfil', icon: User, key: 'profile' },
];

interface BottomNavigationProps {
  activeScreen: string; // La clave de la pantalla activa (ej: 'bookings')
  onNavigate: (screenKey: string) => void; // Función para manejar la navegación
}

export default function BottomNavigation({ activeScreen, onNavigate }: BottomNavigationProps) {
  return (
    <View style={styles.bottomNavContainer}>
      {navItems.map((item) => {
        const isActive = item.key === activeScreen;
        const IconComponent = item.icon;
        
        return (
          <TouchableOpacity 
            key={item.key}
            style={styles.navItem}
            onPress={() => onNavigate(item.key)}
          >
            {/* Ícono */}
            <IconComponent 
              size={24} 
              color={isActive ? '#3B82F6' : '#6B7280'}
            />
            {/* Texto */}
            <Text style={isActive ? styles.navItemActiveText : styles.navItemText}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10, // Un poco más de padding si es necesario
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  navItemText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  navItemActiveText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 2,
  },
});