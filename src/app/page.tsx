"use client";
import Link from "next/link";
import React, { useEffect } from "react";

export default function page() {
    return (
        <div className="flex gap-10 mt-40 justify-center">
            <Link
                className="font-bold underline text-3xl hover:text-4xl transaction-all ease-in-out duration-200"
                href="/admin"
            >
                Admin
            </Link>
            <Link
                className="font-bold underline text-3xl hover:text-4xl transaction-all ease-in-out duration-200"
                href="/superadmin"
            >
                SuperAdmin
            </Link>
            <Link
                className="font-bold underline text-3xl hover:text-4xl transaction-all ease-in-out duration-200"
                href="/seller"
            >
                Seller
            </Link>
        </div>
    );
}
