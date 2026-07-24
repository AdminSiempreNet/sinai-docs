import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import { SinaiSearchDialog } from "@/components/sinai-search-dialog";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Base de conocimiento SINAI",
    template: "%s | SINAI",
  },
  description: "Guías y procesos de la plataforma SINAI de SIEMPRE.NET.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <RootProvider
          theme={{
            defaultTheme: "system",
            enableSystem: true,
          }}
          i18n={{
            locale: "es",
            translations: {
              displayName: "Español",
              search: "Buscar",
              searchNoResult: "No encontramos resultados",
              searchOpen: "Abrir búsqueda",
              searchClose: "Cerrar búsqueda",
              toc: "En esta guía",
              tocNoHeadings: "Esta guía no tiene secciones",
              tocInline: "Contenido de la guía",
              lastUpdate: "Última actualización",
              chooseLanguage: "Elegir idioma",
              nextPage: "Página siguiente",
              previousPage: "Página anterior",
              chooseTheme: "Apariencia",
              themeToggle: "Cambiar apariencia",
              themeLight: "Claro",
              themeDark: "Oscuro",
              themeSystem: "Sistema",
              codeBlockCopy: "Copiar texto",
              codeBlockCopied: "Texto copiado",
              accordionCopyAnchor: "Copiar enlace",
              headingCopyAnchor: "Copiar enlace de la sección",
              bannerClose: "Cerrar aviso",
              menuToggle: "Abrir o cerrar menú",
              sidebarOpen: "Abrir menú lateral",
              sidebarCollapse: "Contraer menú lateral",
              notFoundTitle: "Página no encontrada",
              notFoundDescription: "La página solicitada no existe o fue trasladada.",
              notFoundLink: "Volver al inicio",
            },
          }}
          search={{ SearchDialog: SinaiSearchDialog }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
