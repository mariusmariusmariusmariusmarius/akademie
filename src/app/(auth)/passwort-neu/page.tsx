import { Suspense } from "react";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Neues Passwort" };

export default async function PasswortNeuPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <Suspense>
      <ResetForm token={token ?? ""} />
    </Suspense>
  );
}
