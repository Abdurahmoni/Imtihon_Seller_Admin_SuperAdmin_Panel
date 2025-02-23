"use client";
import React, { useState } from "react";
import SaidBar from "./SaidBar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    if (pathname === "/login" || pathname === "/register") {
        return null;
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="w-full bg-gray-800 text-white p-4 fixed top-0 z-40">
            <div className="flex justify-between items-center">
                <Link href="/" className="relative z-50">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={150}
                        height={150}
                        className="z-50"
                    />
                </Link>
                <button
                    onClick={toggleSidebar}
                    className="p-2 focus:outline-none"
                    aria-label="Toggle Sidebar"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                </button>
            </div>
            <SaidBar isOpen={isSidebarOpen} onClose={toggleSidebar} />
        </div>
    );
}
