import ContentCollection from "@/components/dashboard/ContentCollection";

export const metadata = {
  title: "Certificates Management | Shiv Gorakh Foundation Dashboard",
  description: "Upload, manage, and verify official foundation certificates and legal credentials.",
};

export default function CertificatesPage() {
  return <ContentCollection resource="certificates" />;
}
