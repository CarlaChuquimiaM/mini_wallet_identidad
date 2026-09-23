import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  agregarPendiente,
  contarPendientes,
  procesarPendientes,
} from "@/lib/colaSync";
import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SyncScreen() {
  const netInfo = useNetInfo();
  const [pendientes, setPendientes] = useState(0);
  const [registro, setRegistro] = useState<string[]>([]);
  const theme = useTheme();

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
    await agregarPendiente(`Operación ${pendientes + registro.length + 1}`);
    await actualizarContador();

    if (netInfo.isConnected === true) {
      const resultado = await procesarPendientes();
      setRegistro((prev) => [...prev, ...resultado]);
      await actualizarContador();
    }
  };

  const online = netInfo.isConnected === true;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.contenedor}>
        <ThemedText type="title" style={styles.titulo}>
          Sincronización
        </ThemedText>

        {/* Tarjeta: estado de conexión */}
        <ThemedView
          style={[styles.tarjeta, { backgroundColor: theme.backgroundElement }]}
        >
          <ThemedText
            type="subtitle"
            style={{ color: online ? "#4A7C59" : "#B00020" }}
          >
            {online ? "🟢 En línea" : "🔴 Sin conexión"}
          </ThemedText>
          <ThemedText>Operaciones pendientes: {pendientes}</ThemedText>
        </ThemedView>

        <Pressable
          style={[styles.boton, { backgroundColor: theme.backgroundSelected }]}
          onPress={nuevaOperacion}
        >
          <ThemedText style={styles.botonTexto}>Nueva operación</ThemedText>
        </Pressable>

        {registro.length > 0 && (
          <ThemedView
            style={[
              styles.tarjetaRegistro,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <ThemedText type="subtitle">Registro</ThemedText>
            {registro.map((linea, i) => (
              <ThemedView
                key={`${i}-${linea}`}
                style={[
                  styles.itemRegistro,
                  { borderColor: theme.backgroundSelected },
                ]}
              >
                <ThemedText style={styles.textoRegistro}>{linea}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    gap: Spacing.four,
    padding: Spacing.four,
    paddingBottom: Spacing.two,
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
  boton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 200,
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemRegistro: {
    flexDirection: "row",
    gap: Spacing.two,
    alignSelf: "stretch",
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },

  textoRegistro: {
    flex: 1,
  },
  tarjetaRegistro: {
    width: "100%",
    maxWidth: 600,
    padding: Spacing.four,
    borderRadius: 16,
    gap: 0,
    alignItems: "flex-start",
  },
});
