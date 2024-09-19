import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

function Navbar() {
  return (
    <div className="mb-20">
      <nav className="bg-gradient-to-tr  dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-500 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <Image
              src="/Chat4U.png"
              width={48}
              height={48}
              alt="AI Chat Logo"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              AI Chat 4 U
            </span>
          </Link>

          <div className="flex items-center pt-2 space-x-4">
            <Link href="/dashboard">
              <Button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
