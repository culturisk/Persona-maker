import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "./providers/session-provider.js";

export const metadata = {
  title: "Human-Rooted Segmentation Studio",
  description: "Build personas from human needs, culture, and economics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}