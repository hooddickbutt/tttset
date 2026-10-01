import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/network";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl || "http://127.0.0.1:43123";
  return ["", "/token", "/security", "/technology", "/roadmap", "/docs", "/legal/terms", "/legal/privacy", "/legal/risk", "/app"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    }),
  );
}
