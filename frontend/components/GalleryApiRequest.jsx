"use client";

import { useEffect } from "react";
import api from "@/lib/authApi";

export default function GalleryApiRequest() {
  useEffect(() => {
    async function fetchGalleries() {
      try {
        const response = await api.get("/api/v1/galleries/all");
        console.log("Gallery API response:", response.data);
      } catch (error) {
        console.error("Unable to fetch galleries:", error);
      }
    }

    fetchGalleries();
  }, []);

  return null;
}
