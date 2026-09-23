import { ThemedText } from "@/components/themed-text";
import { rutas } from "@/constants/routes";
import { useSession } from "@/context/SessionContext";
import { useTheme } from "@/hooks/use-theme";
import { autenticarConBiometria, biometriaDisponible } from "@/lib/biometria";
import { existePin, guardarPin, verificarPin } from "@/lib/pin";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput } from "react-native";

export default function Login() {
  const [tienePin, setTienePin] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [hayBiometria, setHayBiometria] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    biometriaDisponible().then(setHayBiometria);
  }, []);

  useEffect(() => {
    existePin().then(setTienePin);
  }, []);

  const { haySesion, entrar } = useSession();

  const usarBiometria = async () => {
    const exito = await autenticarConBiometria();
    if (exito) entrar();
  };

  const manejarCrearPin = async () => {
    await guardarPin(pin);
    entrar(pin);
  };

  const manejarValidarPin = async () => {
    const ok = await verificarPin(pin);
    if (ok) {
      entrar(pin);
    } else {
      setError("PIN incorrecto");
      setPin("");
    }
  };

  if (haySesion) {
    return <Redirect href={rutas.home} />;
  }

  if (tienePin === null) {
    return (
      <ScrollView contentContainerStyle={styles.contenedor}>
        <ThemedText>Cargando…</ThemedText>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <ThemedText type="title" style={styles.titulo}>
        {tienePin ? "Ingresa tu PIN" : "Crea tu PIN"}
      </ThemedText>

      <TextInput
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={6}
        placeholder="PIN"
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { color: theme.text, borderColor: theme.backgroundSelected },
        ]}
      />

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

      {tienePin ? (
        <>
          <Pressable
            style={[
              styles.boton,
              { backgroundColor: theme.backgroundSelected },
            ]}
            onPress={manejarValidarPin}
          >
            <ThemedText style={styles.botonTexto}>Entrar</ThemedText>
          </Pressable>
          {hayBiometria && (
            <Pressable
              style={[
                styles.boton,
                { backgroundColor: theme.backgroundElement },
              ]}
              onPress={usarBiometria}
            >
              <ThemedText style={styles.botonTexto}>
                Entrar con huella
              </ThemedText>
            </Pressable>
          )}
        </>
      ) : (
        <Pressable
          style={[styles.boton, { backgroundColor: theme.backgroundSelected }]}
          onPress={manejarCrearPin}
        >
          <ThemedText style={styles.botonTexto}>Guardar PIN</ThemedText>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 32,
  },
  titulo: {
    fontSize: 24,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    width: 180,
    textAlign: "center",
    fontSize: 20,
    borderRadius: 10,
  },
  boton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: 220,
    alignItems: "center",
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#B00020",
  },
});
