jest.mock("expo-crypto", () => ({
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digestStringAsync: jest.fn(async (_algo: string, texto: string) => {
    return "hash_de_" + texto;
  }),
}));

import { cifrar, descifrar } from "@/lib/cifrado";

describe("cifrado", () => {
  test("descifrar lo cifrado devuelve el texto original", async () => {
    const original = "datos secretos";
    const pin = "123456";

    const cifrado = await cifrar(original, pin);
    const descifrado = await descifrar(cifrado, pin);

    expect(descifrado).toBe(original);
  });

  test("con un PIN distinto NO se recupera el original", async () => {
    const original = "datos secretos";

    const cifrado = await cifrar(original, "123456");
    const descifrado = await descifrar(cifrado, "999999");

    expect(descifrado).not.toBe(original);
  });
});