export const indexingEnabled = import.meta.env.SEO_PRODUCTION === "1";

export interface PageMetadata {
  title: string;
  description: string;
  type: string;
  noindex: boolean;
  graph: unknown[];
}

// Page schemas store site-relative URLs so deployments have one source of truth.
export function absoluteSchema(value: unknown, origin: URL): unknown {
  if (typeof value === "string" && value.startsWith("/")) {
    return new URL(value, origin).href;
  }
  if (Array.isArray(value))
    return value.map((item) => absoluteSchema(item, origin));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        absoluteSchema(item, origin),
      ]),
    );
  }
  return value;
}
