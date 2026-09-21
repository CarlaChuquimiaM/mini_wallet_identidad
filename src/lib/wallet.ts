import * as SecureStore from "expo-secure-store";
import { Wallet } from "ethers";

const CLAVE_PRIVADA = "clave_privada";
export async function crearWalletSiNoExiste(): Promise<string> {
  const existente = await SecureStore.getItemAsync(CLAVE_PRIVADA);
  if (existente !== null) {
    const wallet = new Wallet(existente);
    return wallet.address;
  }

  const wallet = Wallet.createRandom();
  await SecureStore.setItemAsync(CLAVE_PRIVADA, wallet.privateKey);
  return wallet.address;
}
export async function obtenerDireccion(): Promise<string | null> {
  const privada = await SecureStore.getItemAsync(CLAVE_PRIVADA);
  if (privada === null) {
    return null;
  }
  const wallet = new Wallet(privada);
  return wallet.address;
}