import RegisterForm from "@/components/auth/RegisterForm";
import { API_URL } from "@/lib/api";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  try {
    const resp = await fetch(`${API_URL.replace(/\/$/, "")}/api/admin-exists`, {
      cache: "no-store",
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data?.admin_exists) {
        redirect("/login");
      }
    }
  } catch (e) {
    // Si la comprobación falla, dejamos que el formulario se muestre (no redirigimos)
    console.error("Error comprobando admin-exists server-side", e);
  }

  return <RegisterForm />;
}
