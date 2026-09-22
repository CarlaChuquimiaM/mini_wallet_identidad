import * as Crypto from "expo-crypto";

async function derivcarClave(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin,
  );
}

export async function cifrar(texto: string, pin: string): Promise<string> {
  const clave = await derivcarClave(pin);
  let resultado = "";
  //texto='Hola mundo'
  for (let i = 0; i < texto.length; i++) {
    const codigoTexto = texto.charCodeAt(i);
    const codigoClave = clave.charCodeAt(i % clave.length);
    const cifradoChar = codigoTexto ^ codigoClave;
    resultado += String.fromCharCode(cifradoChar);
  }
  return btoa(resultado);
}

export async function descifrar(
  textoCifrado: string,
  pin: string,
): Promise<string> {
  const clave = await derivcarClave(pin);
  const datos = atob(textoCifrado);
  let resultado = "";

  for (let i = 0; i < datos.length; i++) {
    const codigoDato = datos.charCodeAt(i);
    const codigoClave = clave.charCodeAt(i % clave.length);
    const descifradoChar = codigoDato ^ codigoClave;
    resultado += String.fromCharCode(descifradoChar);
  }

  return resultado;
}
