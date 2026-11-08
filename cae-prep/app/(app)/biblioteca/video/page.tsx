import type { Metadata } from "next";
import { VideoPage } from "@/components/library/video-page";

export const metadata: Metadata = { title: "Vídeo" };

export default function VideoRoute() {
  return <VideoPage />;
}
