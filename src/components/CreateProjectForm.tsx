"use client";

import { useActionState } from "react";

type Action = (
  prev: { error?: string },
  formData: FormData,
) => Promise<{ error?: string }>;

const initial: { error?: string } = {};

export function CreateProjectForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex gap-3">
      <input
        name="name"
        placeholder="New project name"
        required
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add project"}
      </button>
      {state.error ? (
        <p className="self-center text-sm text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}
