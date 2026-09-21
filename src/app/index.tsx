import { rutas } from "@/constants/routes";
import { useSession } from "@/context/SessionContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { haySesion } = useSession();
  if (haySesion) {
    return <Redirect href={rutas.home} />;
  }
  return <Redirect href={rutas.login} />;
}
