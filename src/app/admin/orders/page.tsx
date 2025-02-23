"use client";

import React, { useState, useEffect } from "react";
import {
    useGetOrderAllQuery,
    useUpdateOrderStatusMutation,
} from "@/api/ordersApi";
import {
    useGetOrderIdQuery,
    useUpdateOrder_ItemStatusMutation,
} from "@/api/ordersItemApi";

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [changes, setChanges] = useState<{ [key: number]: string | null }>(
        {}
    );
    const [showSaveCancel, setShowSaveCancel] = useState(false);
    const [store, setStore] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderData, setSelectedOrderData] = useState<any>(null);
    useEffect(() => {
        if (typeof window !== "undefined") {
            const sellerToken = localStorage.getItem("sellerToken");
            if (!sellerToken) {
                window.location.href = "/seller/login";
            }

            const storedStore = localStorage.getItem("stores");
            if (storedStore) {
                setStore(JSON.parse(storedStore));
            }
        }
    }, []);

    const { data: initialOrders, refetch: refetchAllOrders } =
        useGetOrderAllQuery([]);

    const [updateOrderStatus] = useUpdateOrderStatusMutation();
    const [updateOrderItemStatus] = useUpdateOrder_ItemStatusMutation();

    const handleStatusChange = (orderItemId: number, newStatus: string) => {
        const validStatuses = [
            "yigilmoqda",
            "yetkazilmoqda",
            "yetkazildi",
            "qabul qilindi",
            "bekor qilindi",
        ];
        if (validStatuses.includes(newStatus)) {
            setChanges((prev) => ({
                ...prev,
                [orderItemId]: newStatus,
            }));
            setShowSaveCancel(true);
        } else {
            setErrorMessage(
                "Noto‘g‘ri status tanlandi. Iltimos, ruxsat etilgan statuslardan birini tanlang."
            );
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    const handleSave = async () => {
        for (const [orderItemId, newStatus] of Object.entries(changes)) {
            if (newStatus) {
                try {
                    await updateOrderStatus({
                        id: parseInt(orderItemId),
                        body: { status: newStatus },
                    }).unwrap();
                    refetchAllOrders();
                    setChanges({});
                    setShowSaveCancel(false);
                    setErrorMessage("Status muvaffaqiyatli yangilandi!");
                    setTimeout(() => setErrorMessage(null), 3000);
                } catch (error) {
                    console.error("Status yangilashda xatolik:", error);
                    setErrorMessage(
                        "Status yangilashda xatolik yuz berdi. Qayta urinib ko‘ring."
                    );
                }
            }
        }
    };

    const handleCancel = () => {
        setChanges({});
        setShowSaveCancel(false);
    };

    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const { data: orderData, refetch: refetchOrder } = useGetOrderIdQuery(
        selectedOrderId || 0,
        {
            skip: !selectedOrderId,
        }
    );
    console.log("orderData", orderData);

    useEffect(() => {
        if (orderData && selectedOrderId) {
            setSelectedOrderData(orderData);
            refetchOrder();
        }
    }, [orderData, selectedOrderId, refetchOrder]);

    const handleShowOrderItems = (orderId: number) => {
        console.log("Tanlangan orderId:", orderId);
        setSelectedOrderId(orderId);
        setIsModalOpen(true);
    };

    const filteredOrders =
        initialOrders?.filter(
            (order: any) =>
                order.id.toString().includes(searchTerm) ||
                order.order_id.toString().includes(searchTerm) ||
                (order.orderItems || []).some(
                    (item: any) =>
                        item.product_id.toString().includes(searchTerm) ||
                        item.status
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        order.customer_id.toString().includes(searchTerm)
                )
        ) || [];

    return (
        <div className="flex">
            <main className="flex-1 p-4 ml-[60px] md:ml-64 mt-[72px] relative transition-all duration-300">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    Buyurtmalar
                </h1>
                <p className="text-gray-600 mb-4">
                    Ushbu sahifada sizning barcha buyurtmalaringiz ro‘yxatini
                    ko‘rishingiz va boshqarishingiz mumkin.
                </p>

                {showSaveCancel && (
                    <div className="mb-6 flex flex-col md:flex-row justify-end gap-4">
                        <button
                            onClick={handleCancel}
                            className="w-full md:w-auto bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={handleSave}
                            className="w-full md:w-auto bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            Saqlash
                        </button>
                    </div>
                )}

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Qidirish (ID, buyurtma ID, mahsulot ID, holat, mijoz ID)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mijoz ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mijoz Ismi
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Manzil
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Jami Narx
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Holati
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mahsulotlar
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order: any) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-100 cursor-pointer"
                                >
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.id}
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.customer_id}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.customer?.first_name ||
                                            "Noma’lum"}{" "}
                                        {order.customer?.last_name || ""}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.address?.street || ""},{" "}
                                        {order.address?.city || ""},{" "}
                                        {order.address?.state || ""}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.total_price} UZS
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
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
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                (changes[order.id] ||
                                                    order.status) ===
                                                "yigilmoqda"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : (changes[order.id] ||
                                                          order.status) ===
                                                      "yetkazilmoqda"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : (changes[order.id] ||
                                                          order.status) ===
                                                      "yetkazildi"
                                                    ? "bg-green-100 text-green-800"
                                                    : (changes[order.id] ||
                                                          order.status) ===
                                                      "qabul qilindi"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            <option value="yigilmoqda">
                                                Yigilmoqda
                                            </option>
                                            <option value="yetkazilmoqda">
                                                Yetkazilmoqda
                                            </option>
                                            <option value="yetkazildi">
                                                Yetkazildi
                                            </option>
                                            <option value="qabul qilindi">
                                                Qabul qilindi
                                            </option>
                                            <option value="bekor qilindi">
                                                Bekor qilindi
                                            </option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() =>
                                                handleShowOrderItems(order.id)
                                            }
                                            className="text-teal-600 hover:text-teal-700 underline"
                                        >
                                            Mahsulotlarni ko‘rish
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {errorMessage && (
                    <p
                        className={`mt-4 text-sm ${
                            errorMessage.includes("xatolik")
                                ? "text-red-500"
                                : "text-green-500"
                        }`}
                    >
                        {errorMessage}
                    </p>
                )}

                {isModalOpen && selectedOrderData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md md:max-w-lg lg:max-w-2xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
                                Buyurtma Ichidagi Mahsulotlar va Ma’lumotlar
                            </h2>
                            <div className="max-h-80 overflow-y-auto space-y-6">
                                {orderData?.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {item.product?.name ||
                                                "Noma’lum mahsulot"}
                                        </h3>
                                        <p className="text-gray-600 mb-2">
                                            Tavsif:{" "}
                                            {item.product?.description ||
                                                "Tavsif mavjud emas"}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-600">
                                                    Narx:{" "}
                                                    <span className="font-medium text-gray-900">
                                                        {item.product?.price ||
                                                            0}{" "}
                                                        UZS
                                                    </span>
                                                </p>
                                                <p className="text-gray-600">
                                                    Miqdor:{" "}
                                                    <span className="font-medium text-gray-900">
                                                        {item.quantity}
                                                    </span>
                                                </p>
                                                <p className="text-gray-600">
                                                    Jami Narx:{" "}
                                                    <span className="font-medium text-gray-900">
                                                        {item.total_price} UZS
                                                    </span>
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">
                                                    Do’kon:{" "}
                                                    <span className="font-medium text-gray-900">
                                                        {item.store?.name ||
                                                            "Noma’lum do’kon"}
                                                    </span>
                                                </p>
                                                <p className="text-gray-600">
                                                    Buyurtma ID:{" "}
                                                    <span className="font-medium text-gray-900">
                                                        {item.order_id}
                                                    </span>
                                                </p>
                                                <p className="text-gray-600">
                                                    Mahsulot ID:{" "}
                                                    <span className="font-medium text-gray-900">
                                                        {item.product_id}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {item.product?.image?.map(
                                                (
                                                    image: string,
                                                    index: number
                                                ) => (
                                                    <div
                                                        key={index}
                                                        className="relative w-full h-40 rounded-lg overflow-hidden shadow-md"
                                                    >
                                                        <img
                                                            src={`https://desirable-stillness-production.up.railway.app/product/${image}`}
                                                            alt={`${
                                                                item.product
                                                                    ?.name ||
                                                                "Mahsulot"
                                                            } rasmi ${
                                                                index + 1
                                                            }`}
                                                            className="rounded-lg"
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedOrderId(null);
                                        refetchAllOrders();
                                    }}
                                    className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 focus:outline-none transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    Yopish
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
