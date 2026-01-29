"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Senha inválida.");
      }
      window.location.reload();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-soft"
    >
      <h2 className="font-display text-2xl text-[#3a231c]">Acesso admin</h2>
      <p className="mt-2 text-sm text-[#7b3b30]">
        Digite a senha configurada no ambiente para continuar.
      </p>
      <div className="mt-4 space-y-2">
        <label className="text-xs font-semibold text-[#7b3b30]">Senha</label>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha administrativa"
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <Button className="mt-4 w-full" type="submit" disabled={loading}>
        {loading ? "Validando..." : "Entrar"}
      </Button>
    </form>
  );
};
