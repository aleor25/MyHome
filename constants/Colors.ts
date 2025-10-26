// En: constants/Colors.ts

const tintColorLight = '#007AFF'; // Azul primario (botones, links, iconos activos) [cite: 5, 54, 67, 93]
const tintColorDark = '#FFF';

export default {
    light: {
        text: '#1C1C1E', // Texto principal oscuro
        textSecondary: '#8A8A8E', // Texto gris (ej. "Vence 08/27") [cite: 48, 64]
        background: '#F2F2F7', // Fondo general de la app (ligeramente gris)
        card: '#FFFFFF', // Fondo de tarjetas y inputs [cite: 47, 89]
        tint: tintColorLight,
        tabIconDefault: '#8A8A8E', // Iconos de tabs inactivos [cite: 66, 68]
        tabIconSelected: tintColorLight,
        border: '#D1D1D6', // Bordes de inputs [cite: 4]

        // Colores de variantes
        primary: tintColorLight,
        secondary: '#E0F0FF', // Fondo azul claro (ej. "Usar como principal") [cite: 49, 156]
        danger: '#FF3B30', // Rojo (ej. "Eliminar") [cite: 55]
        success: '#34C759', // Verde (ej. "Tarjeta agregada exitosamente") [cite: 65]
        warning: '#FFCC00', // Amarillo (ej. estrellas de reseñas) [cite: 102]
    },
    dark: {
        // (Define aquí tu paleta para modo oscuro si es necesario)
        text: '#FFFFFF',
        textSecondary: '#A0A0A5',
        background: '#000000',
        card: '#1C1C1E',
        tint: tintColorDark,
        tabIconDefault: '#A0A0A5',
        tabIconSelected: tintColorDark,
        border: '#3A3A3C',

        primary: tintColorLight,
        secondary: '#1C1C1E',
        danger: '#FF453A',
        success: '#32D74B',
        warning: '#FFD60A',
    },
};