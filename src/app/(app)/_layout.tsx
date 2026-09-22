import AppTabs from "@/components/app-tabs";
import { rutas } from "@/constants/routes";
import { useSession } from "@/context/SessionContext";
import { Redirect } from "expo-router";

export default function AppLayout() {
  const { haySesion } = useSession();

  if (!haySesion) {
    return <Redirect href={rutas.login} />;
  }
  return <AppTabs />;
}
