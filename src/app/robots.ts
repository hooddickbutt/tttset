import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/network";

export default function robots(): MetadataRoute.Robots {
  const base = appUrl || "http://127.0.0.1:43123";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
