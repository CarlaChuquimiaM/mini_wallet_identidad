import { validarCredencial } from "@/lib/credencial";

describe("validarCredencial", () => {
  test("acepta una credencial válida", () => {
    const json = JSON.stringify({
      tipo: "identidad",
      nombre: "Carla",
      documento: "12345678",
      emisor: "Wira",
    });

    const resultado = validarCredencial(json);

    expect(resultado.ok).toBe(true);
  });

  test("rechaza un texto que no es JSON", () => {
    const resultado = validarCredencial("hola mundo");
    expect(resultado.ok).toBe(false);
  });

  test("rechaza un JSON sin los campos requeridos", () => {
    const json = JSON.stringify({ nombre: "Carla" });
    const resultado = validarCredencial(json);
    expect(resultado.ok).toBe(false);
  });
});