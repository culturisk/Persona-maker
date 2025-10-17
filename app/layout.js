import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "Human-Rooted Segmentation Studio",
  description: "Build personas from human needs, culture, and economics",
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