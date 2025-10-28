import { Star, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Modal // 👈 Importante: Usamos Modal
    ,



    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Definición de tipos
type ReviewData = {
    rating: number;
    comment: string;
};

type ReviewModalProps = {
    isVisible: boolean;
    onClose: () => void;
    lodgeTitle: string;
    // Función que el padre pasará para actualizar el estado
    onSubmitReview: (review: ReviewData) => void;
};

// Función Auxiliar para Estrellas Editables
const renderStars = (count: number, setRating: (r: number) => void) => {
    return [...Array(5)].map((_, i) => (
        <TouchableOpacity
            key={i}
            onPress={() => setRating(i + 1)} 
            style={styles.starButton}
        >
            <Star
                size={28}
                fill={i < count ? '#FBBF24' : '#E5E7EB'}
                color={i < count ? '#FBBF24' : '#E5E7EB'}
            />
        </TouchableOpacity>
    ));
};

export default function ReviewModal({ isVisible, onClose, lodgeTitle, onSubmitReview }: ReviewModalProps) {
    const [newComment, setNewComment] = useState(''); 
    const [newRating, setNewRating] = useState(0); 

    const handleSubmit = () => {
        if (newComment.trim() === '' || newRating === 0) {
            Alert.alert('Error', 'Por favor, escribe un comentario y selecciona una calificación.');
            return;
        }

        // Llama a la función del padre
        onSubmitReview({
            rating: newRating,
            comment: newComment.trim(),
        });
        
        // Resetear y cerrar el modal
        setNewComment(''); 
        setNewRating(0); 
        onClose();
    };

    return (
        <Modal
            animationType="slide" 
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    
                    {/* ENCABEZADO Y BOTÓN DE CERRAR */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Agrega reseña para {lodgeTitle}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* CALIFICACIÓN */}
                    <View style={styles.ratingInputContainer}>
                        <Text style={styles.ratingLabel}>Tu calificación:</Text>
                        <View style={styles.ratingStarsEditable}>
                            {renderStars(newRating, setNewRating)} 
                        </View>
                    </View>

                    {/* COMENTARIO */}
                    <TextInput
                        style={styles.commentInput}
                        onChangeText={setNewComment}
                        value={newComment}
                        placeholder="Escribe aquí tu experiencia detallada..."
                        placeholderTextColor="#9CA3AF"
                        multiline={true}
                        numberOfLines={4}
                    />

                    {/* BOTÓN DE ENVÍO */}
                    <TouchableOpacity
                        style={[styles.submitButton, (newComment.trim() === '' || newRating === 0) && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={newComment.trim() === '' || newRating === 0}
                    >
                        <Text style={styles.submitButtonText}>Enviar Comentario</Text>
                    </TouchableOpacity>
                    
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    modalView: {
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        padding: 5,
    },
    ratingInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    ratingStarsEditable: {
        flexDirection: 'row',
        gap: 4,
    },
    starButton: {
        paddingHorizontal: 2,
    },
    commentInput: {
        minHeight: 120,
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#111827',
        textAlignVertical: 'top', 
        backgroundColor: '#F9FAFB',
        width: '100%',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        width: '100%',
    },
    submitButtonDisabled: {
        backgroundColor: '#93C5FD',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
});