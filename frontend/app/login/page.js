import AuthForm from "@/components/AuthForm";
import { getSafeRedirect } from "@/lib/safeRedirect";

export const metadata = {
  title: "Sign In | Shiv Gorakh Welfare Foundation",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return (
    <AuthForm
      mode="login"
      redirectTo={getSafeRedirect(params?.redirect)}
    />
  );
}
