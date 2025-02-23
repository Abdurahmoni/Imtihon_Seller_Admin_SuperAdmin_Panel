"use client";

import { useGetAllproductsQuery } from "@/api/productApi";
import { useGetAdminsQuery, useGetOneUserQuery } from "@/api/userApi";

import Link from "next/link";

export default function Page() {
    if (typeof window !== "undefined") {
        const user = localStorage.getItem("superadminToken");
        if (!user) {
            window.location.href = "/superadmin/login";
        }
    }
    const { data: seller } = useGetOneUserQuery([]);
    const { data: admin } = useGetAdminsQuery("admin");

    const { data: sellerr } = useGetAdminsQuery("seller");
    const { data: customer } = useGetAdminsQuery("customer");
    const { data: product } = useGetAllproductsQuery([]);

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
                        SuperAdmin Paneli
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Ushbu panelda sizning savdo faoliyatingiz, buyurtmalar
                        va boshqa muhim ma’lumotlaringizni kuzatishingiz mumkin.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">
                                Adminlar soni
                            </h2>
                            <p className="text-gray-600">{admin?.length} ta</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">
                                Sotuvchilar soni
                            </h2>
                            <p className="text-gray-600">
                                {sellerr?.length} ta
                            </p>
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
                                    Produktlar soni
                                </span>
                                <span className="text-gray-800 font-medium">
                                    {product?.length} ta
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
                    </div>
                </main>
            </div>
        </div>
    );
}
