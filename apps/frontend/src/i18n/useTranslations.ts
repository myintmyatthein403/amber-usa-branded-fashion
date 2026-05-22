"use client";

import { useStore } from "@/store/useStore";
import en from "./messages/en.json";
import my from "./messages/my.json";

const messages = { en, my } as const;

type Messages = typeof en;
type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<Messages>;

function getNested(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function useTranslations() {
  const locale = useStore((s) => s.locale);
  const dict = messages[locale] ?? messages.en;
  return (key: TranslationKey) => getNested(dict as Record<string, unknown>, key);
}
