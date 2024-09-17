import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'


function Navbar() {
    return (
        <div className="mb-20">
            <nav className="bg-gradient-to-tr from-purple-100 mb-10 to-lime-200 dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-500 dark:border-gray-600">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Image src="/Chat4U.png" width={48} height={48} className="" alt="Flowbite Logo" />
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">AI Chat 4 U</span>
                    </Link>

                    <Link href="/dashboard" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Get started</Button>
                    </Link>
                </div>
                
                
            </nav>



        </div>
    )
}

export default Navbar
