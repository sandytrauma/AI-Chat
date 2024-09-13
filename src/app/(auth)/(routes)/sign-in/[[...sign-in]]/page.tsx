import { SignIn } from '@clerk/nextjs';

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <SignIn
      afterSignInUrl="/dashboard"
      />
    </div>
  );
};

export default SignInPage;
