"use client";

import { usePathname } from "next/navigation";

export default function SellerPage() {
    const pathname = usePathname();

    return (
        <div className="p-6">
            <p className="text-gray-600">
                Hozirgi URL: {pathname.split("/")[1]}
                {pathname}
            </p>
        </div>
    );
}
