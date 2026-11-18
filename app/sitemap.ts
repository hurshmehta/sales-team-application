import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: "https://hurshmehta.com",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://hurshmehta.com/ai",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
