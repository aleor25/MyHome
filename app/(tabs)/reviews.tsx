// import { MapPin, Star, Wifi } from 'lucide-react-native';
// import React, { useState } from 'react';
// import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import BottomNavigation from '../../components/layouts/BottomNavigation'; // 1. Importa el nuevo componente

// export default function EcoLodgeCard() {
  
//   // 2. Nuevo estado para manejar la pantalla activa
//   const [activeScreen, setActiveScreen] = useState('bookings'); 
  
//   // Función para simular la navegación (imprime en consola)
//   const handleNavigation = (screenKey: string) => {
//     setActiveScreen(screenKey);
//     console.log('Navegando a:', screenKey);
//   };
  
//   const [newComment, setNewComment] = useState(''); 
//   const [newRating, setNewRating] = useState(0); 

//   const services = [
//     'Wifi de alta velocidad',
//     'Cama queen',
//     'Estacionamiento',
//     'Desayuno',
//     'Aire acondicionado',
//     'Vista a la montaña'
//   ];

//   const [reviews, setReviews] = useState([
//     {
//       name: 'Ana P.',
//       avatar: 'https://i.pravatar.cc/150?img=1',
//       rating: 5,
//       comment: 'Lugar perfecto para desconectar. El personal fue muy atento y las vistas increíbles.'
//     },
//     {
//       name: 'Luis M.',
//       avatar: 'https://i.pravatar.cc/150?img=12',
//       rating: 4,
//       comment: 'Habitación cómoda y buen desayuno. Me encantó la terraza al atardecer.'
//     },
//     {
//       name: 'María G.',
//       avatar: 'https://i.pravatar.cc/150?img=5',
//       rating: 5,
//       comment: 'Excelente relación calidad-precio y muy cerca de rutas de senderismo.'
//     }
//   ]);

//   const renderStars = (count: number, size: number = 16) => {
//     return [...Array(5)].map((_, i) => (
//       <TouchableOpacity
//         key={i}
//         onPress={() => setNewRating(i + 1)} 
//         disabled={size !== 24}
//       >
//         <Star
//           size={size}
//           fill={i < count ? '#FBBF24' : '#E5E7EB'}
//           color={i < count ? '#FBBF24' : '#E5E7EB'}
//         />
//       </TouchableOpacity>
//     ));
//   };

//   const handleSubmitComment = () => {
//     if (newComment.trim() === '' || newRating === 0) {
//       alert('Por favor, escribe un comentario y selecciona una calificación.');
//       return;
//     }

//     const newReview = {
//       name: 'Usuario Actual', 
//       avatar: 'https://i.pravatar.cc/150?img=30', 
//       rating: newRating,
//       comment: newComment.trim(),
//     };

//     setReviews([newReview, ...reviews]); 
//     setNewComment(''); 
//     setNewRating(0); 
//     console.log('Comentario enviado:', newReview);
//   };

//   return (
//     // Importante: Eliminar el estilo del menú de la vista padre
//     // para que la barra de navegación inferior pueda flotar si es necesario.
//     <View style={styles.mainContainer}> 
//       <ScrollView style={styles.scrollViewContent}> 
      
//         {/* Header (El resto del código se mantiene igual) */}
//         <View style={styles.header}>
//           {/* ... Contenido del Header ... */}
//           <View style={styles.logoContainer}>
//             <View style={styles.logo}>
//               <Text style={styles.logoText}>🏠</Text>
//             </View>
//             <View>
//               <Text style={styles.logoTitle}>M</Text>
//               <Text style={styles.logoSubtitle}>At home</Text>
//             </View>
//           </View>
//         </View>

//         {/* Galería de imágenes */}
//         <View style={styles.gallery}>
//           <Image 
//             source={{ uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop' }}
//             style={styles.mainImage}
//           />
//           <Image 
//             source={{ uri: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=200&h=300&fit=crop' }}
//             style={styles.thumbnailImage}
//           />
//         </View>

//         <View style={styles.content}>
//           {/* Título y precio */}
//           <View style={styles.titleRow}>
//             <Text style={styles.title}>Eco Lodge Sierra</Text>
//             <View>
//               <Text style={styles.price}>$68<Text style={styles.priceUnit}> / noche</Text></Text>
//             </View>
//           </View>

//           {/* Ubicación */}
//           <View style={styles.location}>
//             <MapPin size={16} color="#6B7280" />
//             <Text style={styles.locationText}>Valle Verde, México</Text>
//           </View>

//           {/* Badges */}
//           <View style={styles.badges}>
//             <View style={styles.badgeRating}>
//               <Star size={16} fill="#FBBF24" color="#FBBF24" />
//               <Text style={styles.badgeRatingNumber}>4.7</Text>
//               <Text style={styles.badgeRatingCount}>(128)</Text>
//             </View>
//             <View style={styles.badgeGreen}>
//               <Text style={styles.badgeGreenText}>Sostenible</Text>
//             </View>
//             <View style={styles.badgeBlue}>
//               <Wifi size={12} color="#1D4ED8" />
//               <Text style={styles.badgeBlueText}>Wifi gratis</Text>
//             </View>
//           </View>

//           {/* Descripción */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Descripción</Text>
//             <Text style={styles.description}>
//               Refugio moderno rodeado de naturaleza. Habitaciones luminosas, terraza con vista a la sierra y desayuno local incluido. Ideal para escapadas románticas y actividades al aire libre.
//             </Text>
//           </View>

//           {/* Servicios */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Servicios</Text>
//             <View style={styles.servicesGrid}>
//               {services.map((service, idx) => (
//                 <View key={idx} style={styles.serviceItem}>
//                   <Text style={styles.serviceText}>{service}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>

//           {/* SECCIÓN: AGREGAR COMENTARIO */}
//           <View style={[styles.section, styles.commentSection]}>
//             <Text style={styles.sectionTitle}>✍️ Agregar un comentario</Text>
            
//             <View style={styles.ratingInputContainer}>
//               <Text style={styles.ratingLabel}>Tu calificación:</Text>
//               <View style={styles.ratingStarsEditable}>
//                 {renderStars(newRating, 24)} 
//               </View>
//             </View>

//             <TextInput
//               style={styles.commentInput}
//               onChangeText={setNewComment}
//               value={newComment}
//               placeholder="Escribe aquí tu experiencia..."
//               placeholderTextColor="#9CA3AF"
//               multiline={true}
//               numberOfLines={4}
//             />
//             <TouchableOpacity
//               style={styles.submitButton}
//               onPress={handleSubmitComment}
//               disabled={newComment.trim() === '' || newRating === 0}
//             >
//               <Text style={styles.submitButtonText}>
//                 Enviar Comentario
//               </Text>
//             </TouchableOpacity>
//           </View>
          
//           {/* Reseñas */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Reseñas de huéspedes</Text>
//             {reviews.map((review, idx) => (
//               <View key={idx} style={styles.review}>
//                 <Image source={{ uri: review.avatar }} style={styles.avatar} />
//                 <View style={styles.reviewContent}>
//                   <View style={styles.reviewHeader}>
//                     <Text style={styles.reviewName}>{review.name}</Text>
//                     <View style={styles.reviewStars}>
//                       {renderStars(review.rating)}
//                     </View>
//                   </View>
//                   <Text style={styles.reviewComment}>{review.comment}</Text>
//                 </View>
//               </View>
//             ))}
//           </View>

//           {/* Botones */}
//           <View style={styles.buttons}>
//             <TouchableOpacity style={styles.buttonSecondary}>
//               <Text style={styles.buttonSecondaryText}>Ver disponibilidad</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.buttonPrimary}>
//               <Text style={styles.buttonPrimaryText}>Reservar ahora</Text>
//             </TouchableOpacity>
//           </View>

//         </View>
//       </ScrollView>

//       {/* 3. Reemplazar el código del menú inferior con el componente */}
//       <BottomNavigation 
//         activeScreen={activeScreen}
//         onNavigate={handleNavigation}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   // Nuevo estilo de contenedor principal para que la navegación esté fuera del ScrollView
//   mainContainer: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   scrollViewContent: {
//     flex: 1,
//   },
  
//   // NOTA: Se eliminaron los estilos de bottomNav, navItem y navItemActive
//   // del EcoLodgeCard.js ya que ahora están en BottomNavigation.js.
  
//   header: {
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//   },
//   logoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   logo: {
//     width: 40,
//     height: 40,
//     backgroundColor: '#10B981',
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoText: {
//     fontSize: 20,
//   },
//   logoTitle: {
//     color: '#059669',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   logoSubtitle: {
//     color: '#6B7280',
//     fontSize: 12,
//   },
//   gallery: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     gap: 8,
//   },
//   mainImage: {
//     flex: 1,
//     height: 160,
//     borderRadius: 16,
//   },
//   thumbnailImage: {
//     width: 96,
//     height: 160,
//     borderRadius: 16,
//   },
//   content: {
//     padding: 16,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#111827',
//     flex: 1,
//   },
//   price: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#111827',
//   },
//   priceUnit: {
//     fontSize: 14,
//     color: '#6B7280',
//     fontWeight: 'normal',
//   },
//   location: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginBottom: 12,
//   },
//   locationText: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   badges: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginBottom: 16,
//   },
//   badgeRating: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#F9FAFB',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   badgeRatingNumber: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   badgeRatingCount: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   badgeGreen: {
//     backgroundColor: '#D1FAE5',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   badgeGreenText: {
//     color: '#047857',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   badgeBlue: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#DBEAFE',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   badgeBlueText: {
//     color: '#1D4ED8',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   section: {
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//     marginBottom: 12,
//   },
//   description: {
//     fontSize: 14,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   servicesGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   serviceItem: {
//     width: '48%',
//     backgroundColor: '#D1FAE5',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   serviceText: {
//     color: '#047857',
//     fontSize: 14,
//   },
//   review: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 16,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   reviewContent: {
//     flex: 1,
//   },
//   reviewHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 4,
//   },
//   reviewName: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   reviewStars: {
//     flexDirection: 'row',
//     gap: 2,
//   },
//   reviewComment: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   commentSection: {
//     padding: 16,
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   ratingInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//     justifyContent: 'space-between',
//   },
//   ratingLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#111827',
//   },
//   ratingStarsEditable: {
//     flexDirection: 'row',
//     gap: 4,
//   },
//   commentInput: {
//     height: 100,
//     borderColor: '#D1D5DB',
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 10,
//     fontSize: 14,
//     color: '#111827',
//     textAlignVertical: 'top', 
//     backgroundColor: '#FFFFFF',
//     marginBottom: 12,
//   },
//   submitButton: {
//     backgroundColor: '#10B981',
//     paddingVertical: 12,
//     borderRadius: 24,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   buttons: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 16,
//   },
//   buttonSecondary: {
//     flex: 1,
//     backgroundColor: '#D1FAE5',
//     paddingVertical: 12,
//     borderRadius: 24,
//     alignItems: 'center',
//   },
//   buttonSecondaryText: {
//     color: '#047857',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   buttonPrimary: {
//     flex: 1,
//     backgroundColor: '#3B82F6',
//     paddingVertical: 12,
//     borderRadius: 24,
//     alignItems: 'center',
//   },
//   buttonPrimaryText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });

// app/(tabs)/index.tsx
// RUTA DE IMPORTACIÓN: '../../components/layouts/BottomNavigation'

import { router } from 'expo-router'; // Necesario para la navegación a la pantalla de reseñas
import { MapPin, Star, Wifi } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BottomNavigation from '../../components/layouts/BottomNavigation';

// -------------------------------------------------------------------
// DATOS INICIALES (Simulando la base de datos)
// -------------------------------------------------------------------
const initialPlaces = [
  {
    key: 'sierra',
    title: 'Eco Lodge Sierra',
    location: 'Valle Verde, México',
    price: 68,
    rating: 4.7,
    reviews: [
      { name: 'Ana P.', rating: 5, comment: 'Lugar perfecto.' },
      { name: 'Luis M.', rating: 4, comment: 'Habitación cómoda.' },
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
      { name: 'María G.', rating: 5, comment: 'Vistas espectaculares.' },
      { name: 'Juan P.', rating: 5, comment: 'Una joya escondida.' },
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

  // ⭐️ FUNCIÓN CLAVE: Navegación a la pantalla de reseñas dinámicas
  const goToReviews = () => {
    if (activePlace) {
      // Navega a /reviews/[sierra] o /reviews/[playa]
      router.push({ pathname: '/(tabs)/reviews/[lodgeId]', params: { lodgeId: activePlace.key } });
    }
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

          {/* UBICACIÓN */}
          <View style={styles.location}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>{activePlace.location}</Text>
          </View>

          {/* BADGES */}
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

          {/* DESCRIPCIÓN */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>
              {activePlace.description}
            </Text>
          </View>

          {/* SERVICIOS */}
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

          {/* ⭐️ SECCIÓN DE RESEÑAS (Botón de Navegación) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reseñas de huéspedes</Text>
            
            <View style={styles.reviewSummary}>
                <Star size={20} fill="#FBBF24" color="#FBBF24" />
                <Text style={styles.reviewSummaryText}>
                    {activePlace.rating.toFixed(1)} ({activePlace.reviews.length} opiniones)
                </Text>
            </View>

            <TouchableOpacity 
                style={styles.reviewButton}
                onPress={goToReviews}
            >
                <Text style={styles.reviewButtonText}>Ver todas las reseñas y comentar</Text>
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

      <BottomNavigation 
        activeScreen={activeScreen}
        onNavigate={handleNavigation}
      />
    </View>
  );
}

// -------------------------------------------------------------------
// COMPONENTE: PlaceSelector (Si no lo creaste como archivo separado)
// -------------------------------------------------------------------
type Place = {
    key: string;
    title: string;
    location: string;
    price: number;
    rating: number;
    reviews: { name: string; rating: number; comment: string }[];
    mainImage: string;
    thumbnailImage: string;
    description: string;
};

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
// ESTILOS PRINCIPALES
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
  reviewSummary: { // ⭐️ ESTILO NUEVO
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
  },
  reviewSummaryText: { // ⭐️ ESTILO NUEVO
      fontSize: 16,
      color: '#4B5563',
      fontWeight: '500',
  },
  reviewButton: { // ⭐️ ESTILO NUEVO
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: '#DBEAFE',
      borderRadius: 8,
      alignItems: 'center',
  },
  reviewButtonText: { // ⭐️ ESTILO NUEVO
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