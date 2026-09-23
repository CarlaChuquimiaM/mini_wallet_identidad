import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/context/SessionContext";
import { useTheme } from "@/hooks/use-theme";
import { guardarIdentidad } from "@/lib/almacenIdentidad";
import { validarCredencial, type Credencial } from "@/lib/credencial";
import { verificarPin } from "@/lib/pin";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function Escanear() {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [credencial, setCredencial] = useState<Credencial | null>(null);
  const [error, setError] = useState("");
  const { pin } = useSession();
  const [textoCifrado, setTextoCifrado] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [pidiendoPin, setPidiendoPin] = useState(false);
  const [pinTemporal, setPinTemporal] = useState("");
  const theme = useTheme();

  const reiniciar = () => {
    setEscaneado(false);
    setCredencial(null);
    setError("");
    setGuardado(false);
    setPidiendoPin(false);
    setPinTemporal("");
    setTextoCifrado("");
  };

  const escanear = ({ data }: { data: string }) => {
    if (escaneado) return;
    setEscaneado(true);
    const resultado = validarCredencial(data);
    if (resultado.ok) {
      setCredencial(resultado.datos);
      setError("");
    } else {
      setError(resultado.error);
      setCredencial(null);
    }
  };

  const ejecutarGuardado = async (pinAUsar: string) => {
    try {
      const cifrado = await guardarIdentidad(credencial!, pinAUsar);
      setTextoCifrado(cifrado);
      setGuardado(true);
      setPidiendoPin(false);
      setPinTemporal("");
    } catch (e) {
      setError("No se pudo guardar (¿cancelaste la biometría?)");
    }
  };

  const guardarCredencial = async () => {
    if (!credencial) return;
    if (!pin) {
      setPidiendoPin(true);
      return;
    }
    await ejecutarGuardado(pin);
  };

  const confirmarPinTemporal = async () => {
    const ok = await verificarPin(pinTemporal);
    if (ok) {
      await ejecutarGuardado(pinTemporal);
    } else {
      setError("PIN incorrecto");
    }
  };

  if (!permiso) {
    return <View style={{ flex: 1 }} />;
  }

  if (!permiso.granted) {
    return (
      <View style={styles.centro}>
        <ThemedText style={{ textAlign: "center" }}>
          Necesitamos permiso para usar la cámara y escanear el QR
        </ThemedText>
        <Pressable
          style={[styles.boton, { backgroundColor: theme.backgroundSelected }]}
          onPress={pedirPermiso}
        >
          <ThemedText style={styles.botonTexto}>Dar permiso</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={escaneado ? undefined : escanear}
      />

      {credencial && (
        <ThemedView
          style={[
            styles.resultado,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <ScrollView contentContainerStyle={{ gap: 10 }}>
            <ThemedText type="subtitle">Credencial válida</ThemedText>
            <ThemedText>Nombre: {credencial.nombre}</ThemedText>
            <ThemedText>Documento: {credencial.documento}</ThemedText>

            {guardado ? (
              <>
                <ThemedText style={{ color: "#4A7C59", fontWeight: "600" }}>
                  Guardada 🔒
                </ThemedText>
                <ThemedText style={{ fontSize: 11, opacity: 0.7 }}>
                  Así se guarda (cifrado):
                </ThemedText>
                <ThemedText
                  selectable
                  style={{ fontSize: 10, fontFamily: "monospace" }}
                >
                  {textoCifrado}
                </ThemedText>
              </>
            ) : pidiendoPin ? (
              <>
                <ThemedText>Ingresa tu PIN para guardar:</ThemedText>
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
                    {
                      color: theme.text,
                      borderColor: theme.backgroundSelected,
                    },
                  ]}
                />
                {error !== "" && (
                  <ThemedText style={styles.error}>{error}</ThemedText>
                )}
                <Pressable
                  style={[
                    styles.boton,
                    { backgroundColor: theme.backgroundSelected },
                  ]}
                  onPress={confirmarPinTemporal}
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
                onPress={guardarCredencial}
              >
                <ThemedText style={styles.botonTexto}>
                  Guardar credencial
                </ThemedText>
              </Pressable>
            )}

            <Pressable
              style={[styles.boton, styles.botonSecundario]}
              onPress={reiniciar}
            >
              <ThemedText style={styles.botonTexto}>Escanear otro</ThemedText>
            </Pressable>
          </ScrollView>
        </ThemedView>
      )}

      {!credencial && error !== "" && (
        <ThemedView
          style={[
            styles.resultado,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <ThemedText style={styles.error}>{error}</ThemedText>
          <Pressable
            style={[styles.boton, styles.botonSecundario]}
            onPress={reiniciar}
          >
            <ThemedText style={styles.botonTexto}>Escanear otro</ThemedText>
          </Pressable>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  resultado: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    maxHeight: "60%",
    padding: 20,
    borderRadius: 12,
    gap: 10,
  },
  inputPin: {
    borderWidth: 1,
    padding: 10,
    width: 140,
    textAlign: "center",
    fontSize: 18,
    borderRadius: 8,
    alignSelf: "center",
  },
  boton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  botonSecundario: {
    backgroundColor: "#6F4E37",
  },
  botonTexto: {
    fontSize: 15,
    fontWeight: "600",
  },
  error: {
    color: "#B00020",
  },
});
