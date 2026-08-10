import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = { title: "Account — Maggie's Trail" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <AccountClient />
    </div>
  );
}
