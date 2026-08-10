import type { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = { title: "Admin — Maggie's Trail" };

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <AdminClient />
    </div>
  );
}
