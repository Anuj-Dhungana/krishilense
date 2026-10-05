"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result: unknown = await response.json();

      if (
        response.ok &&
        typeof result === "object" &&
        result !== null &&
        "success" in result &&
        result.success === true
      ) {
        router.replace("/admin");
        return;
      }

      setError(
        typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
          ? result.error
          : "गलत युजरनेम वा पासवर्ड (Invalid credentials)"
      );
    } catch (requestError: unknown) {
      console.error("Admin login request failed:", requestError);
      setError("लगइन असफल भयो (Login failed). Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl" aria-hidden="true">🌾</div>
          <h1 className="text-2xl font-extrabold text-emerald-900">KrishiLens Nepal</h1>
          <p className="mt-1 text-sm text-slate-500">Admin Login / व्यवस्थापक लगइन</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Username / युजरनेम
            </label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password / पासवर्ड
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in... / लगइन हुँदैछ..." : "Sign in / लगइन"}
          </button>
        </form>
      </div>
    </main>
  );
}
