// En: components/ui/RatingStars.tsx
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons'; // O tu librería de iconos
import React from 'react';
import { StyleSheet, View } from 'react-native';

type RatingStarsProps = {
    rating: number; // ej. 4.7
    size?: number;
};

export function RatingStars({ rating, size = 16 }: RatingStarsProps) {
    const theme = 'light';
    const starColor = Colors[theme].warning;
    const emptyColor = Colors[theme].border;

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