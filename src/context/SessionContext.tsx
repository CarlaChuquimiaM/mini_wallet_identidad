import { createContext, ReactNode, useContext, useState } from "react";

type SesionContextType = {
  haySesion: boolean;
  pin: string | null;
  entrar: (pin?: string) => void;
  salir: () => void;
};

const SesionContext = createContext<SesionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [haySesion, setHaySesion] = useState(false);
  const [pin, setPin] = useState<string | null>(null);

  const entrar = (pinIngresado?: string) => {
    if (pinIngresado) {
      setPin(pinIngresado);
    }
    setHaySesion(true);
  };

  const salir = () => {
    setPin(null);
    setHaySesion(false);
  };

  return (
    <SesionContext.Provider value={{ haySesion, pin, entrar, salir }}>
      {children}
    </SesionContext.Provider>
  );
}

export function useSession() {
  const contexto = useContext(SesionContext);
  if (contexto === undefined) {
    throw new Error("useSession debe usarse dentro de un SessionProvider");
  }
  return contexto;
}
