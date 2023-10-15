import "~/styles/globals.css";
import { Inter } from "next/font/google";
import { twMerge } from "tailwind-merge";
import "./layout.css";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Brock Finance",
  description: "TODO",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={twMerge(
          "bg-background font-sans text-foreground",
          inter.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
