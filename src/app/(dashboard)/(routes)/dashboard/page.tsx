import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import ChatContainer from "@/components/ChatContainer"; // Adjust the import path as needed

const ChatPage = () => {
  return (
    <>
      <SignedIn>
        <ChatContainer />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default ChatPage;
