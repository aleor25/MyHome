import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Property } from "@/data/models/Property";

export default function AccommodationDetailScreen() {
  const params = useLocalSearchParams();
  const property = params as unknown as Property;

  const services = ["Wifi", "Cama queen", "Estacionamiento", "Desayuno", "AC"];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Image source={{ uri: property.imageUrl }} style={{ width: "100%", height: 250 }} />

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>{property.name}</Text>
        <Text style={{ fontSize: 16, color: "#555" }}>Valle Verde, México</Text>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 8 }}>
          ${property.price} / noche
        </Text>

        <View style={{ marginVertical: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Servicios</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
            {services.map((s) => (
              <View
                key={s}
                style={{
                  backgroundColor: "#e0f2f1",
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>Descripción</Text>
        <Text>
          Refugio moderno rodeado de naturaleza. Ideal para escapadas tranquilas.
        </Text>

        <View style={{ marginVertical: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#007AFF",
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Ver disponibilidad</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#4CAF50",
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Reservar ahora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
