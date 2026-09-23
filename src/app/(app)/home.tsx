import { Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useSession } from "@/context/SessionContext";
import { useTheme } from "@/hooks/use-theme";
import { leerIdentidad } from "@/lib/almacenIdentidad";
import { verificarPin } from "@/lib/pin";
import { crearWalletSiNoExiste } from "@/lib/wallet";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const [direccion, setDireccion] = useState<string | null>(null);
  const { pin, salir } = useSession();
  const [datos, setDatos] = useState<any>(null);
  const [error, setError] = useState("");
  const [pidiendoPin, setPidiendoPin] = useState(false);
  const [pinTemporal, setPinTemporal] = useState("");
  const theme = useTheme();

  useEffect(() => {
    crearWalletSiNoExiste().then(setDireccion);
  }, []);

  const verDatos = async (pinAUsar: string) => {
    try {
      const identidad = await leerIdentidad(pinAUsar);
      if (identidad === null) {
        setError("No hay datos guardados aún");
      } else {
        setDatos(identidad);
        setError("");
        setPidiendoPin(false);
      }
    } catch (e) {
      setError("No se pudo acceder (¿cancelaste la huella?)");
    }
  };

  const manejarVerDatos = async () => {
    if (pin) {
      await verDatos(pin);
    } else {
      setPidiendoPin(true);
    }
  };

  const confirmarPin = async () => {
    const ok = await verificarPin(pinTemporal);
    if (ok) {
      await verDatos(pinTemporal);
    } else {
      setError("PIN incorrecto");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.contenedor}>
        <ThemedText type="title" style={styles.titulo}>
          Mi Wallet
        </ThemedText>

        <ThemedView
          style={[styles.tarjeta, { backgroundColor: theme.backgroundElement }]}
        >
          <ThemedText type="subtitle">Tu dirección</ThemedText>
          <ThemedText selectable style={styles.direccion}>
            {direccion ?? "Generando wallet..."}
          </ThemedText>
        </ThemedView>

        <ThemedView
          style={[styles.tarjeta, { backgroundColor: theme.backgroundElement }]}
        >
          {datos ? (
            <>
              <ThemedText type="subtitle">Mis datos</ThemedText>
              <ThemedText>Nombre: {datos.nombre}</ThemedText>
              <ThemedText>Documento: {datos.documento}</ThemedText>
              <ThemedText>Tipo: {datos.tipo}</ThemedText>
              <ThemedText>Emisor: {datos.emisor}</ThemedText>
            </>
          ) : pidiendoPin ? (
            <>
              <ThemedText>Ingresa tu PIN para ver tus datos:</ThemedText>
              <TextInput
                value={pinTemporal}
                onChangeText={setPinTemporal}
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                placeholder="PIN"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.inputPin,
                  { color: theme.text, borderColor: theme.backgroundSelected },
                ]}
              />
              <Pressable
                style={[
                  styles.boton,
                  { backgroundColor: theme.backgroundSelected },
                ]}
                onPress={confirmarPin}
              >
                <ThemedText style={styles.botonTexto}>Confirmar</ThemedText>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[
                styles.boton,
                { backgroundColor: theme.backgroundSelected },
              ]}
              onPress={manejarVerDatos}
            >
              <ThemedText style={styles.botonTexto}>Ver mis datos</ThemedText>
            </Pressable>
          )}

          {error !== "" && (
            <ThemedText style={styles.error}>{error}</ThemedText>
          )}
        </ThemedView>

        <Pressable style={[styles.boton, styles.botonSalir]} onPress={salir}>
          <ThemedText style={[styles.botonTexto, { color: "#fff" }]}>
            Salir
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    alignItems: "center",
    gap: Spacing.four,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  titulo: {
    marginTop: Spacing.three,
  },
  tarjeta: {
    width: "100%",
    maxWidth: 600,
    padding: Spacing.two,
    borderRadius: 16,
    gap: Spacing.two,
    alignItems: "center",
  },
  direccion: {
    fontSize: 13,
    textAlign: "center",
  },
  inputPin: {
    borderWidth: 1,
    padding: 12,
    width: 160,
    textAlign: "center",
    fontSize: 18,
    borderRadius: 10,
    marginVertical: Spacing.two,
  },
  boton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 180,
  },
  botonSalir: {
    backgroundColor: "#6F4E37",
    position: "static",
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#B00020",
    marginTop: Spacing.two,
  },
});
