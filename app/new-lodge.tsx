// app/new-lodge.tsx

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- Componentes Reutilizables ---

// 1. Componente para Tags/Chips de Servicios
interface ServiceChipProps {
    service: string;
    isSelected: boolean;
    onPress: () => void;
}

const ServiceChip: React.FC<ServiceChipProps> = ({ service, isSelected, onPress }) => (
    <TouchableOpacity
        style={[
            styles.chip,
            isSelected ? styles.chipSelected : styles.chipDefault
        ]}
        onPress={onPress}
    >
        <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : styles.chipTextDefault]}>
            {service}
        </Text>
    </TouchableOpacity>
);

// 2. Componente de Entrada de Texto Simple
interface CustomInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'numeric';
    required?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, placeholder, value, onChangeText, keyboardType = 'default', required = false }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
            style={styles.input}
            placeholder={`EJ: ${placeholder}`}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            placeholderTextColor="#AAAAAA"
        />
    </View>
);

// --- Lista de Servicios para los Chips ---
const ALL_SERVICES = [
    'Wifi de alta velocidad', 'Estacionamiento', 'Desayuno incluido',
    'Aire acondicionado', 'Vista a la montaña', 'Piscina', 'Gym',
    'Spa', 'Restaurante', 'Bar', 'Servicio a la habitación', 'TV por cable',
];


// --- Pantalla Principal del Formulario ---

export default function NewLodgeScreen() {
    // ⭐️ Configuración de Estados
    const [name, setName] = useState('Eco Lodge Sierra');
    const [location, setLocation] = useState('Valle Verde, México');
    const [category, setCategory] = useState('Lodge'); // Simplificado como string en lugar de Picker
    const [price, setPrice] = useState('68');
    const [bedType, setBedType] = useState(''); // Simplificado
    const [capacity, setCapacity] = useState('2 personas');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    // Función para manejar la selección/deselección de servicios
    const toggleService = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    // Función para seleccionar imágenes
    const pickImage = async () => {
        // La dependencia expo-image-picker ya está en tu package.json
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImages(prev => [...prev, ...result.assets]);
        }
    };
    
    // Función de Registro
    const handleRegister = () => {
        if (!name || !location || !price) {
            Alert.alert("Error", "Por favor, completa todos los campos requeridos (*).");
            return;
        }
        // Lógica para enviar datos...
        Alert.alert("Registro Exitoso", `Lugar: ${name} registrado con ${selectedServices.length} servicios.`);
        // console.log({ name, location, price, description, images, selectedServices });
    };

    return (
        <View style={styles.fullScreenContainer}>
            <Stack.Screen options={{ 
                title: 'Nuevo Lugar', 
                headerShown: true,
                // Si quieres que el header sea blanco (como en la imagen), usa:
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTitleStyle: { color: '#000000' }
            }} />
            
            <ScrollView contentContainerStyle={styles.container}>
                
                {/* ⭐️ Header Visual (Similar al de la imagen) */}
                <View style={styles.visualHeader}>
                    <Ionicons name="home-outline" size={24} color="#000" />
                    <Text style={styles.visualTitle}>Nuevo Lugar</Text>
                    <Text style={styles.subtitle}>Registra un nuevo lugar de reserva</Text>
                </View>

                {/* ⭐️ Información Básica */}
                <Text style={styles.sectionTitle}>Información básica</Text>
                <CustomInput
                    label="Nombre del lugar"
                    placeholder="Eco Lodge Sierra"
                    value={name}
                    onChangeText={setName}
                    required
                />
                <CustomInput
                    label="Ubicación"
                    placeholder="Valle Verde, México"
                    value={location}
                    onChangeText={setLocation}
                    required
                />
                
                {/* ⭐️ Categoría, Precio, Tipo de Cama y Capacidad (Fila) */}
                <View style={styles.row}>
                    {/* Categoría (Picker simplificado) */}
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Categoría <Text style={styles.required}>*</Text></Text>
                        <View style={styles.picker}>
                            <Text>{category}</Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
                        </View>
                    </View>
                    
                    {/* Precio por noche */}
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Precio por noche"
                            placeholder="68"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            required
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    {/* Tipo de cama (Picker simplificado) */}
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Tipo de cama <Text style={styles.required}>*</Text></Text>
                        <View style={styles.picker}>
                            <Text>{bedType || 'Seleccionar'}</Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
                        </View>
                    </View>
                    
                    {/* Capacidad */}
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Capacidad"
                            placeholder="2 personas"
                            value={capacity}
                            onChangeText={setCapacity}
                            required
                        />
                    </View>
                </View>

                {/* ⭐️ Descripción */}
                <Text style={styles.label}>Descripción <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe el lugar, sus características especiales y lo que lo hace único..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#AAAAAA"
                />

                {/* ⭐️ Imágenes */}
                <Text style={styles.sectionTitle}>Imágenes</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    <MaterialIcons name="cloud-upload" size={24} color="#999" />
                    <Text style={styles.uploadText}>Subir imagen</Text>
                </TouchableOpacity>
                <Text style={styles.imageNote}>* Se recomienda subir al menos 3 imágenes</Text>
                
                {images.length > 0 && (
                    <Text style={styles.imageNote}>Imágenes cargadas: {images.length}</Text>
                )}

                {/* ⭐️ Servicios Incluidos */}
                <Text style={styles.sectionTitle}>Servicios incluidos</Text>
                <View style={styles.chipsContainer}>
                    {ALL_SERVICES.map((service) => (
                        <ServiceChip
                            key={service}
                            service={service}
                            isSelected={selectedServices.includes(service)}
                            onPress={() => toggleService(service)}
                        />
                    ))}
                </View>

                {/* ⭐️ Botones de Acción */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                        <Text style={styles.registerButtonText}>Registrar lugar</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

// --- Estilos ---
const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#F7F7F7', // Fondo ligeramente gris para la pantalla
    },
    container: {
        padding: 20,
        backgroundColor: '#FFFFFF', // El contenedor principal del formulario es blanco
        borderRadius: 10,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    // Header Visual (Nuevo Lugar)
    visualHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    visualTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 5,
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 15,
        marginBottom: 10,
    },
    // Inputs
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
        color: '#333',
        fontWeight: '600',
    },
    required: {
        color: 'red',
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#FAFAFA',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 15,
    },
    // Fila y Pickers
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    halfInput: {
        width: '48%',
    },
    picker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#FAFAFA',
    },
    // Chips de Servicios
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    chipDefault: {
        backgroundColor: '#EEEEEE',
        borderColor: '#DDDDDD',
        borderWidth: 1,
    },
    chipSelected: {
        backgroundColor: '#E0F7FA', // Fondo claro para el verde/azul de selección
        borderColor: '#00BCD4',
        borderWidth: 1,
    },
    chipText: {
        fontSize: 14,
    },
    chipTextDefault: {
        color: '#555',
    },
    chipTextSelected: {
        color: '#00BCD4', // Color de texto para el chip seleccionado
        fontWeight: 'bold',
    },
    // Image Picker
    imagePicker: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        borderWidth: 2,
        borderColor: '#DDDDDD',
        borderStyle: 'dashed',
        borderRadius: 8,
        marginBottom: 5,
        backgroundColor: '#FAFAFA',
    },
    uploadText: {
        color: '#999',
        marginTop: 5,
        fontSize: 14,
    },
    imageNote: {
        fontSize: 12,
        color: '#777',
        marginBottom: 15,
    },
    // Botones
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderColor: '#DDDDDD',
        borderWidth: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    registerButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#00BFA5', // Color verde distintivo
        marginLeft: 10,
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});