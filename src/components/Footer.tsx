import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer: React.FC = () => {
    return (
        <footer className="text-teal-950  font-mono py-6">
            <div className="p-4  border-secondary border-t border-teal-700"></div>
            <div className="container  mx-auto px-4">
                <div className="flex flex-col md:flex-row md:justify-between">

                    <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="mt-2 space-y-1">
                            <li>
                                <Link href="/">
                                    <p className="text-sm hover:underline">Home</p>
                                </Link>
                            </li>


                        </ul>
                    </div>
                    <div>
                        <Image
                        src="/reshot-icon-namaste-FNKJ7G32XH.svg"
                        height={48}
                        width={48}
                        alt="Namaste_icon"
                        priority
                        className="border rounded ring-2"
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Follow Us</h3>
                        <div className="flex space-x-4 mt-2">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                <svg className="w-6 h-6 text-blue-600 hover:text-blue-800" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12.07c0-5.2-4.24-9.44-9.44-9.44C7.36 2.63 3.12 6.87 3.12 12.07c0 4.71 3.32 8.67 7.7 9.81V14.5H8.79v-2.7h1.91V10.5c0-1.88 1.16-2.9 2.81-2.9.79 0 1.56.06 2.31.17v2.53h-1.26c-1.23 0-1.49.6-1.49 1.49v1.95h2.76l-.44 2.7h-2.32v7.08c4.38-1.14 7.7-5.1 7.7-9.81z" />
                                </svg>
                            </a>

                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                                <svg className="w-6 h-6 text-blue-400 hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.23 5.924c-.815.361-1.69.605-2.605.715a4.55 4.55 0 0 0 1.987-2.518 9.09 9.09 0 0 1-2.887 1.1 4.542 4.542 0 0 0-7.735 4.142 12.87 12.87 0 0 1-9.38-4.75 4.532 4.532 0 0 0 1.404 6.071 4.493 4.493 0 0 1-2.065-.572v.057a4.553 4.553 0 0 0 3.636 4.457 4.564 4.564 0 0 1-2.058.078 4.56 4.56 0 0 0 4.24 3.15 9.137 9.137 0 0 1-5.661 1.956 9.03 9.03 0 0 1-1.09-.064A12.87 12.87 0 0 0 7.45 21c8.768 0 13.556-7.27 13.556-13.556 0-.21-.004-.42-.012-.63a9.638 9.638 0 0 0 2.369-2.46z" />
                                </svg>
                            </a>

                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                <svg className="w-6 h-6 text-pink-500 hover:text-pink-700" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.057 0 3.42.011 4.62.067 1.1.056 1.839.24 2.268.491.48.274.82.634 1.158 1.158.251.43.435 1.168.491 2.268.056 1.2.067 1.564.067 4.62s-.011 3.42-.067 4.62c-.056 1.1-.24 1.839-.491 2.268-.274.48-.634.82-1.158 1.158-.43.251-1.168.435-2.268.491-1.2.056-1.563.067-4.62.067s-3.42-.011-4.62-.067c-1.1-.056-1.839-.24-2.268-.491a3.89 3.89 0 0 1-1.158-1.158c-.251-.43-.435-1.168-.491-2.268-.056-1.2-.067-1.564-.067-4.62s.011-3.42.067-4.62c.056-1.1.24-1.839.491-2.268.274-.48.634-.82 1.158-1.158.43-.251 1.168-.435 2.268-.491 1.2-.056 1.563-.067 4.62-.067zM12 5.832a6.21 6.21 0 0 0-6.216 6.222c0 3.423 2.795 6.21 6.216 6.21 3.423 0 6.222-2.787 6.222-6.21A6.21 6.21 0 0 0 12 5.832zM12 17.19a5.366 5.366 0 0 1-5.359-5.358A5.366 5.366 0 0 1 12 6.474a5.366 5.366 0 0 1 5.359 5.358A5.366 5.366 0 0 1 12 17.19zM16.343 6.485a1.316 1.316 0 0 0-1.319-1.319 1.316 1.316 0 0 0-1.319 1.319 1.316 1.316 0 0 0 1.319 1.319 1.316 1.316 0 0 0 1.319-1.319z" />
                                </svg>
                            </a>

                        </div>
                    </div>
                </div>
                <div className="mt-6 border-t border-gray-700 pt-4 text-center">
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} Site created by{' '}
                        <a
                            href="https://github.com/sandytrauma/sections-of-law"
                            className="github-button"
                        >
                            sandytrauma
                        </a>. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
