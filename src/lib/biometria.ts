import * as LocalAuthentication from "expo-local-authentication";

export async function autenticarConBiometria(): Promise<boolean> {
  const hayHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hayHardware) {
    return false;
  }

  const estaRegistrado = await LocalAuthentication.isEnrolledAsync();
  if (!estaRegistrado) {
    return false;
  }
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: "Desbloquea la app",
    fallbackLabel: "Usar PIN del dispositivo",
    cancelLabel: "Cancelar",
  });

  return resultado.success;
}

export async function biometriaDisponible(): Promise<boolean> {
  const hayHardware = await LocalAuthentication.hasHardwareAsync();
  const estaRegistrado = await LocalAuthentication.isEnrolledAsync();
  return hayHardware && estaRegistrado;
}
