import './globals.css'; // Import global styles
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>          
          <title>AI-Chat4u</title>
          <meta charSet="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <meta name="description" content="AI Chat Application" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className="h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}