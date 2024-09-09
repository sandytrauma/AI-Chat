import './globals.css';
import { ClerkProvider, SignInButton, SignedIn, SignedOut} from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>Chat App</title>
        </head>
        <body>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
