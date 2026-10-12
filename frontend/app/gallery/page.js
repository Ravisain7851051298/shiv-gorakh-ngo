import GalleryView from "@/components/gallery/GalleryView";

export const metadata = {
  title: "Photo & Video Gallery | Shiv Gorakh Welfare Foundation Rampur",
  description:
    "Explore our complete documentary archive: verified rescue photographs, animal birth control drives, daily stray feeder rounds, and frontline emergency video recordings in Rampur, Uttar Pradesh.",
  keywords: [
    "NGO gallery",
    "animal rescue photos",
    "stray dog feeding videos Rampur",
    "animal welfare Uttar Pradesh",
    "Shiv Gorakh Welfare Foundation media",
    "emergency animal trauma rescue",
    "ABC spay neuter camp",
  ],
  openGraph: {
    title: "Field Photography & Live Video Gallery | Shiv Gorakh Welfare Foundation",
    description:
      "Witness frontline animal welfare realities: authentic field photos, verified rescue albums, and documentary video recordings from Rampur, UP.",
    images: ["/services/1.jpeg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo & Video Gallery | Shiv Gorakh Welfare Foundation",
    description:
      "Explore on-ground rescues, feeder rounds, and medical camps through our verified field media gallery.",
    images: ["/services/1.jpeg"],
  },
};

export default function GalleryPage() {
  return <GalleryView />;
}
