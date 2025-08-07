
"use client";

import { Tablet } from "lucide-react";

export default function TabletPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <Tablet className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Página do Tablet</h1>
      <p className="text-muted-foreground">Esta página está em construção.</p>
    </div>
  );
}
