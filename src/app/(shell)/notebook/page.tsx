import type { Metadata } from "next";
import NotebookClient from "@/components/NotebookClient";

export const metadata: Metadata = { title: "Notebook — Maggie's Trail" };

export default function NotebookPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-extrabold text-ink dark:text-paper">Notebook</h1>
      <NotebookClient />
    </div>
  );
}
