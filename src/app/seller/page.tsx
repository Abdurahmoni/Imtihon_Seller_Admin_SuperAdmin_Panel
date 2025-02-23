"use client";

import { useGetOneUserQuery } from "@/api/userApi";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
    const { data: seller } = useGetOneUserQuery([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        if (!localStorage.getItem("sellerToken")) {
            window.location.href = "/seller/login";
        }

        if (seller?.stores?.[0]) {
            localStorage.setItem("stores", JSON.stringify(seller.stores[0]));
        }
    }, [seller]);

    if (!isClient) {
        return null; // Prevents hydration mismatch
    }

    if (!seller?.is_active) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    Sotuvchi Paneli
                </h1>
                <p className="text-gray-600 mb-4">
                    Ushbu panelda sizning savdo faoliyatingiz, buyurtmalar va
                    boshqa muhim ma’lumotlaringizni kuzatishingiz mumkin.
                </p>
                <p className="text-red-600 mb-4">
                    Sizning foydalanuvchining admin tomonidan tasdiqlanishini
                    kuting
                    {seller?.is_active ? " faqat" : " emas"}
                </p>
            </div>
        );
    }

    const pendingOrders = seller?.orders?.filter(
        (order: any) => order.status === "yigilmoqda"
    );

    return (
        <div>
            <div className="flex">
                <main className="flex-1 p-4 ml-64 mt-[72px] relative">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">
                        Sotuvchi Paneli
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Ushbu panelda sizning savdo faoliyatingiz, buyurtmalar
                        va boshqa muhim ma’lumotlaringizni kuzatishingiz mumkin.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">
                                Barcha Buyurtmalar
                            </h2>
                            <p className="text-gray-600">
                                {seller?.orders?.length} ta
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">
                                Jami Mahsulotlar
                            </h2>
                            <p className="text-gray-600">
                                {seller?.products?.length} ta
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">
                                Haridorlar
                            </h2>
                            <p className="text-gray-600">
                                {seller?.cartItems?.length} ta
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            Buyurtma Holatlari
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                    Buyurtma berilgan
                                </span>
                                <span className="text-gray-800 font-medium">
                                    {seller?.orders?.length} ta
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                    Tayyorlanayotgan mahsulotlar
                                </span>
                                <span className="text-gray-800 font-medium">
                                    {pendingOrders?.length} ta
                                </span>
                            </div>
                        </div>
                        <Link
                            href="/seller/orders"
                            className="mt-4 inline-block text-teal-600 hover:text-teal-700"
                        >
                            Barcha buyurtmalar →
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}
