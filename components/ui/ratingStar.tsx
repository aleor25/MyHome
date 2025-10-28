import { Ionicons } from '@expo/vector-icons'; // O tu librería de iconos
import React from 'react';
import { StyleSheet, View } from 'react-native';

type RatingStarsProps = {
    rating: number; // ej. 4.7
    size?: number;
};

const ThemeColors = {
  light: {
    primary: '#FFD700',
  },
  dark: {
    primary: '#FFA500',
  },
};

export function RatingStars({ rating, size = 16 }: RatingStarsProps) {
    const theme = 'light';
    const starColor = ThemeColors[theme].warning;
    const emptyColor = ThemeColors[theme].border;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars.push(<Ionicons key={i} name="star" size={size} color={starColor} />);
        } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
            stars.push(<Ionicons key={i} name="star-half" size={size} color={starColor} />);
        } else {
            stars.push(<Ionicons key={i} name="star-outline" size={size} color={emptyColor} />);
        }
    }

    return <View style={styles.container}>{stars}</View>;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});