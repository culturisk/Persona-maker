import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "Pricer - Human-Rooted Segmentation Studio",
  description: "Build personas from human needs, culture, and economics",
  icons: {
    icon: '/logos/1.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}