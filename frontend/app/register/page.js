import AuthForm from "@/components/AuthForm";
import { getSafeRedirect } from "@/lib/safeRedirect";

export const metadata = {
  title: "Create Account | Shiv Gorakh Welfare Foundation",
};

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  return (
    <AuthForm
      mode="register"
      redirectTo={getSafeRedirect(params?.redirect)}
    />
  );
}
