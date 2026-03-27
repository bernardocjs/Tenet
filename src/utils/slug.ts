import { nanoid } from "nanoid";

export function generateSlug(name1: string, name2: string): string {
  const sanitize = (s: string): string =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const base = `${sanitize(name1)}-e-${sanitize(name2)}`;
  const suffix = nanoid(6);
  return `${base}-${suffix}`;
}
