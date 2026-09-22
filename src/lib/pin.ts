import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
const CLAVE_PIN = "pin";

async function hashearPin(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin,
  );
}

export async function guardarPin(pin: string): Promise<void> {
  const hash = await hashearPin(pin);
  await SecureStore.setItemAsync(CLAVE_PIN, hash);
}

export async function verificarPin(pinIngresado: string): Promise<boolean> {
  const hashGuardado = await SecureStore.getItemAsync(CLAVE_PIN);

  if (hashGuardado === null) {
    return false;
  }

  const hashIngresado = await hashearPin(pinIngresado);
  return hashGuardado === hashIngresado;
}

export async function existePin(): Promise<boolean> {
  const hash = await SecureStore.getItemAsync(CLAVE_PIN);
  return hash !== null;
}
