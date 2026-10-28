import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata = {
  title: "Vibrant Heritage, Modern Edge | Ankara Collection",
  description: "Made-to-order Ankara pieces in four colourways.",
};

export const viewport = { width: "device-width", initialScale: 1 };

const themeScript = `
  const savedTheme = localStorage.getItem("ankara-theme");
  const theme = savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
