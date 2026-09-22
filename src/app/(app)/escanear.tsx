import { ThemedText } from "@/components/themed-text";
import { useSession } from "@/context/SessionContext";
import { guardarIdentidad } from "@/lib/almacenIdentidad";
import { validarCredencial, type Credencial } from "@/lib/credencial";
import { verificarPin } from "@/lib/pin";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";

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
  if (!permiso) {
    return <View />;
  }
  if (!permiso.granted) {
    return (
      <View style={styles.centro}>
        <ThemedText>
          Necesitamos permiso para usar la cámara para el escaneer del QR
        </ThemedText>
        <Button title="Dar permiso" onPress={pedirPermiso} />
      </View>
    );
  }

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

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={escaneado ? undefined : escanear}
      />

      {credencial && (
        <View style={styles.resultado}>
          <ThemedText type="subtitle">Credencial válida ✅</ThemedText>
          <ThemedText>Nombre: {credencial.nombre}</ThemedText>
          <ThemedText>Documento: {credencial.documento}</ThemedText>

          {/* Estados de guardado: uno solo, aquí dentro */}
          {guardado ? (
            <>
              <ThemedText style={{ color: "lightgreen" }}>
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
                placeholderTextColor="#888"
                style={styles.inputPin}
              />
              {error !== "" && (
                <ThemedText style={{ color: "red" }}>{error}</ThemedText>
              )}
              <Button title="Confirmar" onPress={confirmarPinTemporal} />
            </>
          ) : (
            <Button title="Guardar credencial" onPress={guardarCredencial} />
          )}

          <Button
            title="Escanear otro"
            onPress={() => {
              setEscaneado(false);
              setCredencial(null);
              setError("");
              setGuardado(false);
              setPidiendoPin(false);
              setPinTemporal("");
            }}
          />
        </View>
      )}

      {/* Error cuando NO hay credencial (QR inválido) */}
      {!credencial && error !== "" && (
        <View style={styles.resultado}>
          <ThemedText style={{ color: "red" }}>{error}</ThemedText>
          <Button
            title="Escanear otro"
            onPress={() => {
              setEscaneado(false);
              setError("");
            }}
          />
        </View>
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
    bottom: 30,
    left: 20,
    right: 20,
    padding: 20,
    backgroundColor: "rgba(78, 63, 34, 1)",
    borderRadius: 12,
    gap: 12,
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
