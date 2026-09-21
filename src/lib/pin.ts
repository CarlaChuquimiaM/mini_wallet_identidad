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
  console.log("GUARDANDO pin:", pin, "→ hash:", hash);
  await SecureStore.setItemAsync(CLAVE_PIN, hash);
}

export async function verificarPin(pinIngresado: string): Promise<boolean> {
  const hashGuardado = await SecureStore.getItemAsync(CLAVE_PIN);
  console.log("hash GUARDADO :", hashGuardado);

  if (hashGuardado === null) {
    console.log("no hay PIN guardado");
    return false;
  }

  const hashIngresado = await hashearPin(pinIngresado);
  console.log("hash INGRESADO:", hashIngresado);
  console.log("¿coinciden?  :", hashGuardado === hashIngresado);

  return hashGuardado === hashIngresado;
}

export async function existePin(): Promise<boolean> {
  const hash = await SecureStore.getItemAsync(CLAVE_PIN);
  return hash !== null;
}
