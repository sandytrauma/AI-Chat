import './globals.css'; // Import global styles
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <head>          
          <title>AI-Chat4u</title>
          <meta charSet="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <meta name="description" content="AI Chat Application" />
          <meta property="og:title" content="AI-Chat4U" />
          <meta property="og:description" content="AI Chat Application" />
          <meta property="og:image" content="/Chat4U.png" /> {/* Optional */}
          <meta property="og:url" content="https://master--ai-chat4u.netlify.app/" /> {/* Optional */}
          <meta name="robots" content="index,follow" />
          <link rel="icon" href="/favicon.ico" />
          {/* Add any additional external scripts or styles here */}
        </head>
        <body className="h-full">
          <div className="h-full">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
