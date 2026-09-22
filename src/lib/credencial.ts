import { z } from "zod";

export const EsquemaCredencial = z.object({
  tipo: z.string(),
  nombre: z.string(),
  documento: z.string(),
  emisor: z.string(),
});

export type Credencial = z.infer<typeof EsquemaCredencial>;
export function validarCredencial(
  texto: string,
): { ok: true; datos: Credencial } | { ok: false; error: string } {
  try {
    const json = JSON.parse(texto);
    const resultado = EsquemaCredencial.safeParse(json);
    if (resultado.success) {
      return { ok: true, datos: resultado.data };
    }
    return {
      ok: false,
      error: "El QR no tiene el formato de credencial esperado",
    };
  } catch {
    return { ok: false, error: "El QR no contiene un JSON válido" };
  }
}
