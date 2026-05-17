import React, { Suspense } from "react";
import ResetPasswordClient from "@/components/auth/ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
