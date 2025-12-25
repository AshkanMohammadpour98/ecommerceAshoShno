import AuthGuard from "@/components/AuthGuard";
import MyAccountClient from "@/components/MyAccountClient";
// import PanelClientWrapper from "@/components/PanelClientWrapper";
/**
 * این صفحه محافظت شده است
 * AuthGuard توکن را چک می‌کند و decoded را به MyAccountClient پاس می‌دهد
 */
export default async function MyAccountPage() {
  return (
    <AuthGuard>
      <MyAccountClient />
    </AuthGuard>
  );
}
