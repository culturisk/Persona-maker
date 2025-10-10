import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Human-Rooted Segmentation Studio",
  description: "Build personas from human needs, culture, and economics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}