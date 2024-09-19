import Footer from "@/components/Footer";
import "./globals.css"; // Import global styles
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full w-full">
        <head>
          <title>AI-Chat4u</title>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="Chat application using AI technology." />
          <meta property="og:title" content="AI-Chat4U" />
          <meta property="og:description" content="AI Chat Application" />
          <meta property="og:image" content="/Chat4U.png" />
          <meta property="og:url" content="https://master--ai-chat4u.netlify.app/" />
          <meta name="robots" content="index,follow" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className="h-full w-full bg-cover bg-gradient-to-tr whitespace-nowrap from-purple-300 to-violet-300 flex flex-col">
          <Navbar />
          <main className="flex-grow p-4">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
