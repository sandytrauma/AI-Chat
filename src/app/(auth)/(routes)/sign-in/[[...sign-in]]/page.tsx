import { Button } from '@/components/ui/button';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <SignIn
        afterSignInUrl="/dashboard"
      />
      <Link href="/">
       
      </Link>
    </div>
    
  );
};

export default SignInPage;
