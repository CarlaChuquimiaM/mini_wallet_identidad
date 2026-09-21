import { createContext, ReactNode, useContext, useState } from "react";
type SesionContextType = {
  haySesion: boolean;
  entrar: () => void;
  salir: () => void;
};
const SesionContext = createContext<SesionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [haySesion, setHaySesion] = useState(false);
  const entrar = () => {
    console.log("entrar() se ejecutó, haySesion pasa a true");
    setHaySesion(true);
  };
  const salir = () => {
    console.log("salir() se ejecutó, haySesion pasa a false");
    setHaySesion(false);
  };
  return (
    <SesionContext.Provider value={{ haySesion, entrar, salir }}>
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
