jest.mock("@react-native-async-storage/async-storage", () => {
  let almacen: Record<string, string> = {};
  return {
    getItem: jest.fn(async (clave: string) => almacen[clave] ?? null),
    setItem: jest.fn(async (clave: string, valor: string) => {
      almacen[clave] = valor;
    }),
  };
});

import { agregarPendiente, procesarPendientes } from "@/lib/colaSync";

describe("cola idempotente", () => {
  test("procesar dos veces no duplica la operación", async () => {
    await agregarPendiente("operación de prueba");

    const primeraVez = await procesarPendientes();
    const segundaVez = await procesarPendientes();

    expect(primeraVez.length).toBe(1);
    expect(segundaVez.length).toBe(0);
  });
});
