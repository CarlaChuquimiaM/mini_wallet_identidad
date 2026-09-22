import * as SecureStore from "expo-secure-store";
import { cifrar, descifrar } from "@/lib/cifrado";

const CLAVE_IDENTIDAD = "identidad_cifrada";

export async function guardarIdentidad(
  credencial: object,
  pin: string,
): Promise<string> {
  const textoPlano = JSON.stringify(credencial);
  const cifrado = await cifrar(textoPlano, pin);

  await SecureStore.setItemAsync(CLAVE_IDENTIDAD, cifrado, {
    requireAuthentication: true,
    authenticationPrompt: "Autentícate para guardar tus datos",
  });
  return cifrado;
}
export async function leerIdentidad(pin: string): Promise<object | null> {
  const cifrado = await SecureStore.getItemAsync(CLAVE_IDENTIDAD, {
    requireAuthentication: true,
    authenticationPrompt: "Autentícate para ver tus datos",
  });

  if (cifrado === null) {
    return null;
  }

  const textoPlano = await descifrar(cifrado, pin);
  return JSON.parse(textoPlano);
}
export async function existeIdentidad(): Promise<boolean> {
  const cifrado = await SecureStore.getItemAsync(CLAVE_IDENTIDAD);
  return cifrado !== null;
}
