import type { Metadata } from "next";
import { ArticleReader } from "@/components/library/article-reader";

export const metadata: Metadata = { title: "Artículo" };

export default function ArticlePage() {
  return <ArticleReader />;
}
