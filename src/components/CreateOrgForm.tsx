"use client";

import { useActionState } from "react";
import { createOrgAction } from "@/app/actions/org";

const initial: { error?: string } = {};

export function CreateOrgForm() {
  const [state, action, pending] = useActionState(createOrgAction, initial);

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <input
          name="name"
          placeholder="Acme Inc."
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        {state.error ? (
          <p className="mt-1 text-sm text-red-600">{state.error}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create organization"}
      </button>
    </form>
  );
}
