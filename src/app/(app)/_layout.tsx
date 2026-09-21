import AppTabs from "@/components/app-tabs";
import { useSession } from "@/context/SessionContext";
import { Redirect } from "expo-router";

export default function AppLayout() {
  const { haySesion } = useSession();

  if (!haySesion) {
    return <Redirect href="/login" />;
  }
  return <AppTabs />;
}
