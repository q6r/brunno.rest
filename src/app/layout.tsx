import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/Providers";
import { profile } from "@/content/profile";
import { DEFAULT_THEME, THEME_BOOT_SCRIPT, THEME_CSS } from "@/lib/themes";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${profile.name} · ${profile.role}`,
  description: `${profile.role}. Projetos, stack e um pouco sobre mim.`,
};

export const viewport: Viewport = {
  themeColor: "#95a0b1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // O script do <head> troca o data-theme (e o PT/EN troca o lang) antes do React
    // hidratar: suppressHydrationWarning deixa o DOM valer nesses atributos do <html>.
    <html lang="pt-BR" data-theme={DEFAULT_THEME} className={`${spaceGrotesk.variable} antialiased`} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="bg-canvas font-sans text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
