import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: {
    template: '%s | RAAHI',
    default: 'RAAHI - Conscious Travel, Responsible Tourism',
  },
  description: 'Discover unique and responsible travel experiences with RAAHI. Explore conscious travel options and support sustainable tourism.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
