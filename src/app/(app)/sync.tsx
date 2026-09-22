import { ThemedText } from "@/components/themed-text";
import {
  agregarPendiente,
  contarPendientes,
  procesarPendientes,
} from "@/lib/colaSync";
import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { Button, ScrollView } from "react-native";

export default function SyncScreen() {
  const netInfo = useNetInfo();
  const [pendientes, setPendientes] = useState(0);
  const [registro, setRegistro] = useState<string[]>([]);

  const actualizarContador = async () => {
    const n = await contarPendientes();
    setPendientes(n);
  };

  useEffect(() => {
    actualizarContador();
  }, []);

  useEffect(() => {
    if (netInfo.isConnected === true) {
      procesarPendientes().then((resultado) => {
        if (resultado.length > 0) {
          setRegistro((prev) => [...prev, ...resultado]);
        }
        actualizarContador();
      });
    }
  }, [netInfo.isConnected]);

  const nuevaOperacion = async () => {
    await agregarPendiente("Sincronizar credencial " + Date.now());
    await actualizarContador();

    if (netInfo.isConnected === true) {
      const resultado = await procesarPendientes();
      setRegistro((prev) => [...prev, ...resultado]);
      await actualizarContador();
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <ThemedText type="title">Sincronización</ThemedText>

      <ThemedText type="subtitle">
        Estado:{" "}
        {netInfo.isConnected === true ? "🟢 En línea" : "🔴 Sin conexión"}
      </ThemedText>

      <ThemedText>Operaciones pendientes: {pendientes}</ThemedText>

      <Button title="Nueva operación" onPress={nuevaOperacion} />

      <ThemedText type="subtitle">Registro:</ThemedText>
      {registro.map((linea, i) => (
        <ThemedText key={i}>{linea}</ThemedText>
      ))}
    </ScrollView>
  );
}
