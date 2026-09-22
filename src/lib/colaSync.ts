import AsyncStorage from "@react-native-async-storage/async-storage";

type Operacion = {
  id: string;
  descripcion: string;
};

const CLAVE_PENDIENTES = "operaciones_pendientes";
const CLAVE_PROCESADAS = "operaciones_procesadas";

async function obtenerPendientes(): Promise<Operacion[]> {
  const datos = await AsyncStorage.getItem(CLAVE_PENDIENTES);
  return datos ? JSON.parse(datos) : [];
}

async function obtenerProcesadas(): Promise<string[]> {
  const datos = await AsyncStorage.getItem(CLAVE_PROCESADAS);
  return datos ? JSON.parse(datos) : [];
}

export async function agregarPendiente(descripcion: string): Promise<void> {
  const pendientes = await obtenerPendientes();
  const nueva: Operacion = {
    id: Date.now().toString() + "-" + Math.random().toString(36).slice(2),
    descripcion,
  };
  pendientes.push(nueva);
  await AsyncStorage.setItem(CLAVE_PENDIENTES, JSON.stringify(pendientes));
}

export async function procesarPendientes(): Promise<string[]> {
  const pendientes = await obtenerPendientes();
  const procesadas = await obtenerProcesadas();
  const registro: string[] = [];

  for (const operacion of pendientes) {
    if (procesadas.includes(operacion.id)) {
      continue;
    }
    registro.push(`Procesada: ${operacion.descripcion} (id: ${operacion.id})`);
    procesadas.push(operacion.id);
  }

  await AsyncStorage.setItem(CLAVE_PROCESADAS, JSON.stringify(procesadas));
  await AsyncStorage.setItem(CLAVE_PENDIENTES, JSON.stringify([]));

  return registro;
}

export async function contarPendientes(): Promise<number> {
  const pendientes = await obtenerPendientes();
  return pendientes.length;
}
