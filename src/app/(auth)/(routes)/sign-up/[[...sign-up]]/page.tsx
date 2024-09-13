import { SignUp } from '@clerk/nextjs';



const SignUpPage = () => {
  return (
    
    <div className="flex items-center justify-center w-full h-screen">
      <SignUp
      afterSignInUrl="/dashboard"
      />
    </div>
   
  );

};

export default SignUpPage;
