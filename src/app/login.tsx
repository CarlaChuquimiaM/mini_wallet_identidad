import { ThemedText } from "@/components/themed-text";
import { rutas } from "@/constants/routes";
import { useSession } from "@/context/SessionContext";
import { autenticarConBiometria, biometriaDisponible } from "@/lib/biometria";
import { existePin, guardarPin, verificarPin } from "@/lib/pin";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function Login() {
  const [tienePin, setTienePin] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [hayBiometria, setHayBiometria] = useState(false);

  useEffect(() => {
    biometriaDisponible().then(setHayBiometria);
  }, []);

  useEffect(() => {
    existePin().then(setTienePin);
  }, []);

  const { haySesion, entrar } = useSession();

  const usarBiometria = async () => {
    const exito = await autenticarConBiometria();
    if (exito) {
      entrar();
    }
  };

  const manejarCrearPin = async () => {
    await guardarPin(pin);
    entrar(pin);
  };

  const manejarValidarPin = async () => {
    const verficaPin = await verificarPin(pin);
    if (verficaPin) {
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando…</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <ThemedText type="title" style={{ fontSize: 20 }}>
        {tienePin ? "Ingresa tu PIN" : "Crea tu PIN"}
      </ThemedText>
      <TextInput
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={6}
        placeholder="PIN"
        placeholderTextColor="#999"
        style={{
          borderWidth: 1,
          color: "black",
          padding: 12,
          width: 150,
          textAlign: "center",
          fontSize: 18,
          borderRadius: 8,
        }}
      />

      {error ? <ThemedText style={{ color: "red" }}>{error}</ThemedText> : null}

      {tienePin ? (
        <>
          <Button title="Entrar" onPress={manejarValidarPin} />
          {hayBiometria && (
            <Button title="Entrar con huella" onPress={usarBiometria} />
          )}
        </>
      ) : (
        <Button title="Guardar PIN" onPress={manejarCrearPin} />
      )}
    </View>
  );
}
