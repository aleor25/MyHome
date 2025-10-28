import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Property } from "../data/models/Property";

export default function HomeScreen() {
  const router = useRouter();

  const featuredProperties: Property[] = [
    { id: "1", name: "Eco Lodge Sierra", price: 68, rating: 4.7, imageUrl: "https://placehold.co/400x300/A3E4D7/333333?text=Eco+Lodge" },
    { id: "2", name: "Bungalow Mar Azul", price: 92, rating: 4.9, imageUrl: "https://placehold.co/400x300/A9DFBF/333333?text=Bungalow" },
  ];

  const nearbyProperties: Property[] = [
    { id: "3", name: "Cabaña Montaña", price: 74, rating: 4.6, imageUrl: "https://placehold.co/400x300/F5B7B1/333333?text=Cabaña" },
    { id: "4", name: "Casa Jardín", price: 65, rating: 4.4, imageUrl: "https://placehold.co/400x300/D7BDE2/333333?text=Casa+Jardín" },
  ];

  const [search, setSearch] = useState("");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>MyHome</Text>

      <TextInput
        placeholder="Buscar alojamiento o ciudad"
        value={search}
        onChangeText={setSearch}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 50,
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginBottom: 24,
        }}
      />

      <Section title="Propiedades destacadas" data={featuredProperties} router={router} />
      <Section title="Cerca de ti" data={nearbyProperties} router={router} />
    </ScrollView>
  );
}

function Section({ title, data, router }: { title: string; data: Property[]; router: any }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {data.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={{ marginRight: 12 }}
            onPress={() => router.push({ pathname: "/detail", params: item })}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: 200, height: 150, borderRadius: 10 }}
            />
            <Text style={{ fontWeight: "bold", marginTop: 6 }}>{item.name}</Text>
            <Text>${item.price} / noche</Text>
            <Text>⭐ {item.rating}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
