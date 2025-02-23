"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    useGetOrderStoreQuery,
    useUpdateOrder_ItemStatusMutation,
} from "@/api/ordersItemApi";

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [changes, setChanges] = useState<{ [key: number]: string | null }>(
        {}
    );
    const [showSaveCancel, setShowSaveCancel] = useState(false);

    if (typeof window !== "undefined") {
        if (!localStorage.getItem("sellerToken")) {
            window.location.href = "/seller/login";
        }
    }

    let store = null;
    if (typeof window !== "undefined") {
        store = JSON.parse(localStorage.getItem("stores") || "null");
    }

    const {
        data: initialOrderItems,

        refetch,
    } = useGetOrderStoreQuery(store?.id);
    const [updateOrderItemStatus] = useUpdateOrder_ItemStatusMutation();

    useEffect(() => {
        if (initialOrderItems) {
            setOrderItems(initialOrderItems);
        }
    }, [initialOrderItems]);

    const handleStatusChange = (orderId: number, newStatus: string) => {
        setChanges((prev) => ({
            ...prev,
            [orderId]: newStatus,
        }));
        setShowSaveCancel(true);
    };

    const handleSave = async () => {
        for (const [orderId, newStatus] of Object.entries(changes)) {
            if (newStatus) {
                try {
                    await updateOrderItemStatus({
                        id: parseInt(orderId),
                        status: newStatus,
                    }).unwrap();
                    refetch();
                    setChanges({});
                    setShowSaveCancel(false);
                } catch (error) {
                    console.error("Status yangilashda xatolik:", error);
                }
            }
        }
    };

    const handleCancel = () => {
        setChanges({});
        setShowSaveCancel(false);
        if (initialOrderItems) {
            setOrderItems(initialOrderItems);
        }
    };

    const filteredOrders =
        orderItems?.filter(
            (order: any) =>
                order.id.toString().includes(searchTerm) ||
                order.order_id.toString().includes(searchTerm) ||
                order.product_id.toString().includes(searchTerm) ||
                order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.product?.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                order.order?.customer_id.toString().includes(searchTerm)
        ) || [];

    return (
        <div className="flex">
            <main
                className={`flex-1 p-4 ml-64 mt-[72px] relative transition-all duration-300`}
            >
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    Buyurtmalar
                </h1>
                <p className="text-gray-600 mb-4">
                    Ushbu sahifada sizning barcha buyurtmalaringiz ro'yxatini
                    ko'rishingiz va boshqarishingiz mumkin.
                </p>

                {showSaveCancel && (
                    <div className="mb-6 flex justify-end gap-4">
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            Saqlash
                        </button>
                    </div>
                )}

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Qidirish (ID, buyurtma ID, mahsulot ID, holat, mahsulot nomi, mijoz ID)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Buyurtma ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mahsulot ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mahsulot Nomi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Miqdor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Jami Narx
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Holati
                                </th>
                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Boshqarish
                                </th> */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order: any) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.order_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.product_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.product?.name ||
                                            "Noma’lum mahsulot"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.total_price}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={
                                                changes[order.id] ||
                                                order.status
                                            }
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    order.id,
                                                    e.target.value
                                                )
                                            }
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                (changes[order.id] ||
                                                    order.status) ===
                                                "yigilmoqda"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : (changes[order.id] ||
                                                          order.status) ===
                                                      "yigildi"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            <option value="yigilmoqda">
                                                Yigilmoqda
                                            </option>
                                            <option value="yigildi">
                                                Yigildi
                                            </option>
                                        </select>
                                    </td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <Link
                                            href={`/seller/orders/${order.id}`}
                                            className="text-teal-600 hover:text-teal-700"
                                        >
                                            Tafsilotlar
                                        </Link>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
