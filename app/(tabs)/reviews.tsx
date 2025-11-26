import { MapPin, Star, Wifi } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ReviewModal from '../../components/ReviewModal'; // 👈 1. IMPORTAR EL MODAL

// -------------------------------------------------------------------
// TIPOS DE DATOS (Mejora la legibilidad y tipado)
// -------------------------------------------------------------------
type Review = {
    name: string;
    avatar: string;
    rating: number;
    comment: string;
};

type Place = {
    key: string;
    title: string;
    location: string;
    price: number;
    rating: number;
    reviews: Review[];
    mainImage: string;
    thumbnailImage: string;
    description: string;
};

// -------------------------------------------------------------------
// DATOS INICIALES (Simulando la base de datos)
// -------------------------------------------------------------------
const initialPlaces: Place[] = [
  {
    key: 'sierra',
    title: 'Eco Lodge Sierra',
    location: 'Valle Verde, México',
    price: 68,
    rating: 4.7,
    reviews: [
      { name: 'Ana P.', avatar: 'https://i.pravatar.cc/150?img=1', rating: 5, comment: 'Lugar perfecto para desconectar.' },
      { name: 'Luis M.', avatar: 'https://i.pravatar.cc/150?img=12', rating: 4, comment: 'Habitación cómoda y buen desayuno.' },
    ],
    mainImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
    thumbnailImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=200&h=300&fit=crop',
    description: 'Refugio moderno rodeado de naturaleza. Habitaciones luminosas, terraza con vista a la sierra y desayuno local incluido. Ideal para escapadas románticas y actividades al aire libre.',
  },
  {
    key: 'playa',
    title: 'Cabaña Frente al Mar',
    location: 'Tulum, México',
    price: 120,
    rating: 4.9,
    reviews: [
      { name: 'María G.', avatar: 'https://i.pravatar.cc/150?img=5', rating: 5, comment: 'Vistas espectaculares.' },
      { name: 'Juan P.', avatar: 'https://i.pravatar.cc/150?img=8', rating: 5, comment: 'Una joya escondida.' },
    ],
    mainImage: 'https://images.unsplash.com/photo-1541808293-104c86576b53?w=400&h=300&fit=crop',
    thumbnailImage: 'https://images.unsplash.com/photo-1587786196238-d62f4342d07e?w=200&h=300&fit=crop',
    description: 'Experimenta la tranquilidad de la playa en nuestra cabaña privada. Despierta con el sonido de las olas y disfruta de acceso directo al mar Caribe.',
  },
];

const services = [
  'Wifi de alta velocidad', 'Cama queen', 'Estacionamiento',
  'Desayuno', 'Aire acondicionado', 'Vista a la montaña'
];

export default function EcoLodgeCard() {
    
  const [placesData, setPlacesData] = useState(initialPlaces);
  const [selectedPlaceKey, setSelectedPlaceKey] = useState('sierra');
  const [activeScreen, setActiveScreen] = useState('bookings');
  
  // ⭐️ 2. NUEVO ESTADO: Controla la visibilidad del modal de reseña
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false); 

  // Encontrar el lugar activo
  const activePlace = placesData.find(p => p.key === selectedPlaceKey);

  // MANEJADORES
  const handleNavigation = (screenKey: string) => {
    setActiveScreen(screenKey);
    console.log('Navegando a:', screenKey);
  };

  const handlePlaceSelect = (key: string) => {
    setSelectedPlaceKey(key);
  };

  // ⭐️ 3. FUNCIÓN PARA AÑADIR LA RESEÑA AL ESTADO (llamada desde el Modal)
  const handleAddReview = (newReviewData: { rating: number; comment: string }) => {
    if (!activePlace) return;

    const newReview: Review = {
        name: 'Huésped Actual', // Simulación
        avatar: 'https://i.pravatar.cc/150?img=30', // Simulación
        ...newReviewData
    };

    // Actualiza la lista de lugares, añadiendo la nueva reseña al lugar actual
    const updatedPlacesData = placesData.map(place => {
        if (place.key === activePlace.key) {
            return {
                ...place,
                // Agrega la nueva reseña al inicio de la lista
                reviews: [newReview, ...place.reviews]
            };
        }
        return place;
    });

    setPlacesData(updatedPlacesData);
    console.log('Nueva reseña agregada a:', activePlace.title);
  };

  if (!activePlace) {
    return <View style={styles.mainContainer}><Text>Lugar no encontrado.</Text></View>;
  }

  return (
    <View style={styles.mainContainer}>
      <PlaceSelector 
        places={initialPlaces} 
        selectedKey={selectedPlaceKey}
        onSelect={handlePlaceSelect}
      />

      <ScrollView style={styles.scrollViewContent}>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🏠</Text>
            </View>
            <View>
              <Text style={styles.logoTitle}>M</Text>
              <Text style={styles.logoSubtitle}>At home</Text>
            </View>
          </View>
        </View>

        {/* GALERÍA */}
        <View style={styles.gallery}>
          <Image 
            source={{ uri: activePlace.mainImage }}
            style={styles.mainImage}
          />
          <Image 
            source={{ uri: activePlace.thumbnailImage }}
            style={styles.thumbnailImage}
          />
        </View>

        <View style={styles.content}>
          {/* TÍTULO Y PRECIO */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{activePlace.title}</Text>
            <View>
              <Text style={styles.price}>${activePlace.price}<Text style={styles.priceUnit}> / noche</Text></Text>
            </View>
          </View>

          {/* UBICACIÓN y BADGES (Sin cambios) */}
          <View style={styles.location}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>{activePlace.location}</Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.badgeRating}>
              <Star size={16} fill="#FBBF24" color="#FBBF24" />
              <Text style={styles.badgeRatingNumber}>{activePlace.rating}</Text>
              <Text style={styles.badgeRatingCount}>({activePlace.reviews.length})</Text>
            </View>
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>Sostenible</Text>
            </View>
            <View style={styles.badgeBlue}>
              <Wifi size={12} color="#1D4ED8" />
              <Text style={styles.badgeBlueText}>Wifi gratis</Text>
            </View>
          </View>

          {/* DESCRIPCIÓN y SERVICIOS (Sin cambios) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>
              {activePlace.description}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios</Text>
            <View style={styles.servicesGrid}>
              {services.map((service, idx) => (
                <View key={idx} style={styles.serviceItem}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ❌ SE ELIMINÓ TODA LA SECCIÓN DE AGREGAR COMENTARIO ❌ */}
          {/* <View style={[styles.section, styles.commentSection]}>... </View> */}

          {/* ⭐️ SECCIÓN DE RESEÑAS: Muestra las primeras dos reseñas y el botón para VER/AGREGAR */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reseñas de huéspedes</Text>
            
            <View style={styles.reviewSummary}>
                <Star size={20} fill="#FBBF24" color="#FBBF24" />
                <Text style={styles.reviewSummaryText}>
                    {activePlace.rating.toFixed(1)} ({activePlace.reviews.length} opiniones)
                </Text>
            </View>

            {/* Muestra un par de reseñas (opcional) */}
            {activePlace.reviews.slice(0, 2).map((review, idx) => (
              <View key={idx} style={styles.review}>
                <Image source={{ uri: review.avatar }} style={styles.avatar} />
                <View style={styles.reviewContent}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <View style={styles.reviewStars}>
                      {/* Función auxiliar para renderizar estrellas (necesitas crearla o importarla) */}
                      <RenderStars count={review.rating} size={14} /> 
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              </View>
            ))}

            {/* ⭐️ BOTÓN PARA AGREGAR RESEÑA (Abre el Modal) */}
            <TouchableOpacity 
                style={styles.reviewButton}
                onPress={() => setIsReviewModalVisible(true)} // 👈 ABRIR EL MODAL
            >
                <Text style={styles.reviewButtonText}>Agregar una reseña ahora</Text>
            </TouchableOpacity>
          </View>

          {/* Botones */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buttonSecondary}>
              <Text style={styles.buttonSecondaryText}>Ver disponibilidad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonPrimary}>
              <Text style={styles.buttonPrimaryText}>Reservar ahora</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
      
      {/* ⭐️ 4. AÑADIR EL MODAL */}
      <ReviewModal
          isVisible={isReviewModalVisible}
          onClose={() => setIsReviewModalVisible(false)}
          lodgeTitle={activePlace.title}
          onSubmitReview={handleAddReview}
      />

      
    </View>
  );
}

// -------------------------------------------------------------------
// COMPONENTES AUXILIARES (Asegúrate de que existan)
// -------------------------------------------------------------------
type StarProps = { count: number, size: number };
function RenderStars({ count, size }: StarProps) {
    return (
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            fill={i < count ? '#FBBF24' : '#E5E7EB'}
            color={i < count ? '#FBBF24' : '#E5E7EB'}
          />
        ))}
      </View>
    );
}
//... (PlaceSelector y Estilos - Se asume que no cambian drásticamente)
// -------------------------------------------------------------------
// COMPONENTE: PlaceSelector (Si no lo creaste como archivo separado)
// -------------------------------------------------------------------

type PlaceSelectorProps = {
    places: Place[];
    selectedKey: string;
    onSelect: (key: string) => void;
};

function PlaceSelector({ places, selectedKey, onSelect }: PlaceSelectorProps) {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={selectorStyles.selectorContainer}
            contentContainerStyle={selectorStyles.selectorContent}
        >
            {places.map((place) => {
                const isSelected = place.key === selectedKey;
                return (
                    <TouchableOpacity
                        key={place.key}
                        style={[
                            selectorStyles.selectorItem,
                            isSelected && selectorStyles.selectorItemSelected
                        ]}
                        onPress={() => onSelect(place.key)}
                    >
                        <Text style={[
                            selectorStyles.selectorText,
                            isSelected && selectorStyles.selectorTextSelected
                        ]}>
                            {place.title}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const selectorStyles = StyleSheet.create({
    selectorContainer: {
        maxHeight: 50,
        paddingHorizontal: 16,
        paddingTop: 10,
        marginBottom: 10,
        backgroundColor: '#FFFFFF',
    },
    selectorContent: {
        alignItems: 'center',
    },
    selectorItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    selectorItemSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    selectorText: {
        color: '#4B5563',
        fontWeight: '500',
    },
    selectorTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    }
});


// -------------------------------------------------------------------
// ESTILOS PRINCIPALES (Añadiendo estilos necesarios para la nueva vista de reseña)
// -------------------------------------------------------------------
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
  },
  logoTitle: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },
  gallery: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  mainImage: {
    flex: 1,
    height: 160,
    borderRadius: 16,
  },
  thumbnailImage: {
    width: 96,
    height: 160,
    borderRadius: 16,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceUnit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: 'normal',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badgeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeRatingNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgeRatingCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  badgeGreen: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeGreenText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '500',
  },
  badgeBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeBlueText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceItem: {
    width: '48%',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  serviceText: {
    color: '#047857',
    fontSize: 14,
  },
  // Estilos de reseña existente
  review: { 
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Estilos del botón de reseña
  reviewSummary: { 
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
  },
  reviewSummaryText: { 
      fontSize: 16,
      color: '#4B5563',
      fontWeight: '500',
  },
  reviewButton: { 
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: '#DBEAFE',
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20, // Añade margen inferior para separarlo de los botones finales
  },
  reviewButtonText: { 
      color: '#1D4ED8',
      fontWeight: '600',
      fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#D1FAE5',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#047857',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});