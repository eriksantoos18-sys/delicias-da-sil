import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Delicias da Sil",
  description: "Doces feitos com amor 🍰",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.className} min-h-full flex flex-col`}>
        {children}

        <a
  href="https://wa.me/5582XXXXXXXXX?text=Ol%C3%A1%21%20Vim%20pelo%20site%20da%20Del%C3%ADcias%20da%20Sil."
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Falar conosco pelo WhatsApp"
  title="Fale conosco"
  className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-110 hover:bg-green-600"
>
  <svg
    viewBox="0 0 32 32"
    className="h-8 w-8"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16 3C8.83 3 3 8.61 3 15.5c0 2.43.73 4.8 2.1 6.82L3.72 29l7.05-1.33A13.35 13.35 0 0 0 16 28c7.17 0 13-5.61 13-12.5S23.17 3 16 3zm0 22.9c-1.72 0-3.41-.44-4.89-1.27l-.35-.2-4.18.79.82-3.94-.23-.37A10.18 10.18 0 0 1 5.1 15.5C5.1 9.77 9.99 5.1 16 5.1s10.9 4.67 10.9 10.4S22.01 25.9 16 25.9zm5.98-7.78c-.33-.16-1.94-.92-2.24-1.03-.3-.11-.52-.16-.74.16-.22.32-.85 1.03-1.04 1.24-.19.22-.38.24-.71.08-.33-.16-1.39-.49-2.65-1.57-.98-.94-1.64-2.1-1.83-2.45-.19-.32-.02-.5.14-.66.15-.14.33-.38.49-.57.16-.19.22-.32.33-.54.11-.22.05-.41-.03-.57-.08-.16-.74-1.71-1.01-2.34-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.32-1.14 1.08-1.14 2.63s1.17 3.05 1.33 3.26c.16.22 2.3 3.38 5.57 4.74.78.32 1.38.51 1.86.65.78.24 1.49.21 2.05.13.63-.09 1.94-.76 2.21-1.49.27-.73.27-1.35.19-1.49-.08-.13-.3-.21-.63-.37z" />
  </svg>
</a>
      </body>
    </html>
  );
}