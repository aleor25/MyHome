// app/reviews/[lodgeId].tsx

import { useLocalSearchParams } from 'expo-router'; // Necesario para obtener el ID
import { Send, Star, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LodgeReviewsScreen() {
  
  // ⭐️ OBTENER EL ID DEL LODGE DE LA URL
  const params = useLocalSearchParams();
  const lodgeId = params.lodgeId || 'desconocido'; // Será 'sierra', 'playa', etc.

  const [loading, setLoading] = useState(false);
  
  // ⚠️ SIMULACIÓN DE DATOS: En una app real, este estado se cargaría de la API
  // basándose en el 'lodgeId'
  const [reviews, setReviews] = useState([
    { id: 1, name: 'Ana P.', avatar: 'https://i.pravatar.cc/150?img=1', rating: 5, comment: `Excelente para ${lodgeId}.`, date: '2024-10-15' },
    { id: 2, name: 'Luis M.', avatar: 'https://i.pravatar.cc/150?img=12', rating: 4, comment: `Cómodo y tranquilo en ${lodgeId}.`, date: '2024-10-10' },
  ]);
  
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 0,
    comment: ''
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmitReview = async () => {
    if (!newReview.name || !newReview.rating || !newReview.comment) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    setLoading(true);

    try {
      // ⚠️ CÓDIGO REAL DE API (descomentar y ajustar URL al usar una API real)
      /*
      const response = await fetch(`http://YOUR-API-URL/api/lodges/${lodgeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: newReview.name, rating: newReview.rating, comment: newReview.comment })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      */
      
      // ⭐️ SIMULACIÓN DE RESPUESTA EXITOSA
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      const reviewToAdd = {
        id: Date.now(),
        name: newReview.name,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`, // Avatar aleatorio
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0]
      };

      setReviews([reviewToAdd, ...reviews]);
      setNewReview({ name: '', rating: 0, comment: '' });
      setShowForm(false);
      Alert.alert('Éxito', '¡Reseña enviada exitosamente!');
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo enviar la reseña');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (
    rating: number,
    interactive: boolean = false,
    onPress?: ((rating: number) => void) | null
  ) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => interactive && onPress && onPress(i + 1)}
            disabled={!interactive}
          >
            <Star
              size={interactive ? 32 : 16}
              fill={i < rating ? '#FBBF24' : '#E5E7EB'}
              color={i < rating ? '#FBBF24' : '#E5E7EB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const averageRating = reviews.length > 0 
     ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
     : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header del Lodge */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Reseñas de: {Array.isArray(lodgeId) ? lodgeId.join(', ').toUpperCase() : lodgeId.toUpperCase()}</Text>
          <Text style={styles.location}>Aquí se mostrarían los datos del lugar...</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>$XX</Text>
          <Text style={styles.priceUnit}>por noche</Text>
        </View>
      </View>
      
      {/* Rating promedio */}
      <View style={styles.averageRating}>
        <View style={styles.ratingLeft}>
          <Star size={32} fill="#FBBF24" color="#FBBF24" />
          <Text style={styles.ratingNumber}>{averageRating}</Text>
        </View>
        <View>
          <Text style={styles.ratingCount}>{reviews.length} reseñas</Text>
          <Text style={styles.ratingLabel}>Calificación promedio</Text>
        </View>
      </View>
      
      {/* Botón para mostrar formulario */}
      {!showForm && (
        <TouchableOpacity 
           style={styles.addReviewButton}
          onPress={() => setShowForm(true)}
        >
          <Send size={20} color="#FFF" />
          <Text style={styles.addReviewButtonText}>Escribir una reseña</Text>
        </TouchableOpacity>
      )}
      
      {/* Formulario de nueva reseña */}
      {showForm && (
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Deja tu reseña</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tu nombre *</Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithPadding]}
                value={newReview.name}
                onChangeText={(text) => setNewReview({...newReview, name: text})}
                placeholder="Ej: María García"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calificación *</Text>
            {renderStars(
              newReview.rating, 
              true, 
              (rating) => setNewReview({...newReview, rating})
            )}
            {newReview.rating > 0 && (
              <Text style={styles.ratingText}>
                {newReview.rating} de 5 estrellas
              </Text>
            )}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tu experiencia *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newReview.comment}
              onChangeText={(text) => setNewReview({...newReview, comment: text})}
              placeholder="Cuéntanos sobre tu experiencia..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity 
             style={styles.submitButton}
            onPress={handleSubmitReview}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Send size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>Enviar reseña</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {/* Lista de reseñas */}
      <View style={styles.reviewsContainer}>
        <Text style={styles.reviewsTitle}>
          Reseñas de huéspedes ({reviews.length})
        </Text>
                {reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aún no hay reseñas</Text>
            <Text style={styles.emptyStateSubtext}>
              ¡Sé el primero en compartir tu experiencia!
            </Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <Image 
                 source={{ uri: review.avatar }} 
                 style={styles.avatar}
              />
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                {renderStars(review.rating)}
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
  averageRating: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  ratingCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  addReviewButton: {
    backgroundColor: '#10B981',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addReviewButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  cancelButton: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFF',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  inputWithPadding: {
    paddingLeft: 44,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsContainer: {
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  reviewItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewComment: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
});