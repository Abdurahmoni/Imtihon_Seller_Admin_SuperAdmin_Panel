"use client";

import { useGetAdminsQuery, useGetOneUserQuery } from "@/api/userApi";
import { useEffect } from "react";
import Link from "next/link";
import { useGetAllproductsQuery } from "@/api/productApi";

export default function Page() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (!localStorage.getItem("adminToken")) {
                window.location.href = "/admin/login";
            }
        }
    }, []);

    const { data: seller } = useGetAdminsQuery("seller");
    const { data: customer } = useGetAdminsQuery("customer");
    const { data: product } = useGetAllproductsQuery([]);

    const allProducts =
        seller?.reduce(
            (sum: number, item: any) => sum + item.products.length,
            0
        ) || 0;

    useEffect(() => {
        if (seller?.stores?.[0]) {
            localStorage.setItem("stores", JSON.stringify(seller.stores[0]));
        }
    }, [seller]);

    const orders =
        product?.reduce(
            (sum: number, product: any) => sum + product.orderItems.length,
            0
        ) || 0;

    const pendingOrders = product?.map((product: any) =>
        product.orderItems?.filter(
            (order: any) => order.status === "yigilmoqda"
        )
    );

    return (
        <div>
            <div className="flex">
                <main className="flex-1 p-4 ml-64 mt-[72px] relative">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">
                        Admin Paneli
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Ushbu panelda sizning savdo faoliyatingiz, buyurtmalar
                        va boshqa muhim ma’lumotlaringizni kuzatishingiz mumkin.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">
                                Sotuvchilar soni
                            </h2>
                            <p className="text-gray-600">{seller?.length} ta</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">
                                Jami Mahsulotlar
                            </h2>
                            <p className="text-gray-600">{allProducts} ta</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">
                                Haridorlar
                            </h2>
                            <p className="text-gray-600">
                                {customer?.length} ta
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
                                    {orders} ta
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
                            href="/orders"
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
