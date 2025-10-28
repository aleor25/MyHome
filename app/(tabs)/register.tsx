import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../../constants/firebaseConfig"; // asegúrate de que aquí usas initializeAuth con AsyncStorage

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(""); // Limpia errores anteriores

    // Validaciones básicas
    if (!email || !password) {
      setError("Por favor ingresa correo y contraseña.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate("Home");
    } catch (err: any) {
      console.error("Error al registrar:", err.code, err.message);

      // 🔹 Mensajes más comprensibles
      const firebaseErrors: Record<string, string> = {
        "auth/email-already-in-use": "El correo ya está registrado.",
        "auth/invalid-email": "El correo electrónico no es válido.",
        "auth/weak-password": "La contraseña es demasiado débil.",
      };

      setError(firebaseErrors[err.code] || "Ocurrió un error al registrarte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 10 }} />
      ) : (
        <>
          <Button title="Registrarse" onPress={handleRegister} />
          <View style={{ height: 10 }} />
          <Button title="Ya tengo cuenta" onPress={() => navigation.navigate("Login")} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

