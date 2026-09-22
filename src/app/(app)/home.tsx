import { Button, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useSession } from "@/context/SessionContext";
import { leerIdentidad } from "@/lib/almacenIdentidad";
import { verificarPin } from "@/lib/pin";
import { crearWalletSiNoExiste } from "@/lib/wallet";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const [direccion, setDireccion] = useState<string | null>(null);

  const { pin } = useSession();
  const [datos, setDatos] = useState<any>(null);
  const [error, setError] = useState("");
  const [pidiendoPin, setPidiendoPin] = useState(false);
  const [pinTemporal, setPinTemporal] = useState("");

  useEffect(() => {
    crearWalletSiNoExiste().then(setDireccion);
  }, []);

  const { salir } = useSession();

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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type="subtitle">Tu dirección:</ThemedText>
          <ThemedText selectable>
            {direccion ?? "Generando wallet..."}
          </ThemedText>
        </ThemedView>

        {/* Sección: ver datos de identidad guardados */}
        <ThemedView style={styles.seccionDatos}>
          {datos ? (
            <>
              <ThemedText type="subtitle">Datos:</ThemedText>
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
                placeholderTextColor="#888"
                style={styles.inputPin}
              />
              <Button title="Confirmar" onPress={confirmarPin} />
            </>
          ) : (
            <Button title="Ver mis datos" onPress={manejarVerDatos} />
          )}

          {error !== "" && (
            <ThemedText style={{ color: "red" }}>{error}</ThemedText>
          )}
        </ThemedView>

        <Button title="Salir" onPress={salir} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: "center",
  },
  code: {
    textTransform: "uppercase",
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  seccionDatos: {
    marginTop: 24,
    gap: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  inputPin: {
    borderWidth: 1,
    borderColor: "#888",
    color: "white",
    padding: 10,
    width: 140,
    textAlign: "center",
    fontSize: 18,
    borderRadius: 8,
  },
});
