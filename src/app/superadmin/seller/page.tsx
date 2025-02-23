"use client";

import React, { useState } from "react";
import {
    useGetAdminsQuery,
    useDeleteUserMutation,
    useUpdateAdminMutation,
} from "@/api/userApi";
import { useSignupMutation } from "@/api/authApi";

export default function SellerPage() {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("superadminToken");
        if (!token) {
            window.location.href = "/admin/login";
        }
    }

    const {
        data: sellers,
        isLoading,
        error,
        refetch,
    } = useGetAdminsQuery("seller");
    const [deleteUser] = useDeleteUserMutation();
    const [updateUser] = useUpdateAdminMutation();
    const [signup] = useSignupMutation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState<any>(null);
    const [newSellerData, setNewSellerData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        is_active: true,
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sortByStatus, setSortByStatus] = useState<
        "all" | "active" | "inactive"
    >("all");

    const handleSidebarToggle = (open: boolean) => {
        setIsSidebarOpen(open);
    };

    const getSellerStats = (sellerId: number) => {
        const productsCount =
            sellers?.find((p: any) => p.id === sellerId)?.products?.length || 0;
        const ordersCount =
            sellers?.find((p: any) => p.id === sellerId)?.orders?.length || 0;
        return { productsCount, ordersCount };
    };

    const handleAddSeller = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup({
                first_name: newSellerData.first_name,
                last_name: newSellerData.last_name,
                email: newSellerData.email,
                password: newSellerData.password,
                phone: newSellerData.phone,
                role: "seller",
                is_active: newSellerData.is_active,
            }).unwrap();
            refetch();
            setIsAddModalOpen(false);
            setNewSellerData({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                phone: "",
                is_active: true,
            });
            setErrorMessage("Seller muvaffaqiyatli qo‘shildi!");
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("Seller qo‘shishda xatolik:", error);
            setErrorMessage(
                "Seller qo‘shishda xatolik yuz berdi. Qayta urinib ko‘ring."
            );
        }
    };

    const handleEditSeller = (seller: any) => {
        setSelectedSeller(seller);
        setIsEditModalOpen(true);
        setNewSellerData({
            first_name: seller.first_name || "",
            last_name: seller.last_name || "",
            email: seller.email,
            password: "",
            phone: seller.phone || "",
            is_active: seller.is_active,
        });
    };

    const handleUpdateSeller = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSeller?.id) return;

        const body = {
            first_name: newSellerData.first_name,
            last_name: newSellerData.last_name,
            email: newSellerData.email,
            phone: newSellerData.phone,
            ...(newSellerData.password && { password: newSellerData.password }),
            is_active: newSellerData.is_active,
        };

        try {
            await updateUser({ id: selectedSeller.id, body }).unwrap();
            refetch();
            setIsEditModalOpen(false);
            setSelectedSeller(null);
            setNewSellerData({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                phone: "",
                is_active: true,
            });
            setErrorMessage("Seller muvaffaqiyatli yangilandi!");
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("Seller yangilashda xatolik:", error);
            setErrorMessage(
                "Seller yangilashda xatolik yuz berdi. Qayta urinib ko‘ring."
            );
        }
    };

    const handleDeleteSeller = async (sellerId: number) => {
        if (
            window.confirm(
                "Seller’ni o‘chirishni xohlaysizmi? Bu qaytarib bo‘lmaydi!"
            )
        ) {
            try {
                await deleteUser({ id: sellerId }).unwrap();
                refetch();
                setErrorMessage("Seller muvaffaqiyatli o‘chirildi!");
                setTimeout(() => setErrorMessage(null), 3000);
            } catch (error) {
                console.error("Seller o‘chirishda xatolik:", error);
                setErrorMessage(
                    "Seller o‘chirishda xatolik yuz berdi. Qayta urinib ko‘ring."
                );
            }
        }
    };

    const handleStatusToggle = async (
        sellerId: number,
        currentStatus: boolean
    ) => {
        const newStatus = !currentStatus;
        const body = { is_active: newStatus };

        try {
            await updateUser({ id: sellerId, body }).unwrap();
            refetch();
            setErrorMessage(
                `Seller statusi ${
                    newStatus ? "faol" : "nofaol"
                } holatga o‘zgartirildi!`
            );
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("Seller statusini yangilashda xatolik:", error);
            setErrorMessage(
                "Seller statusini yangilashda xatolik yuz berdi. Qayta urinib ko‘ring."
            );
        }
    };

    const filteredSellers = React.useMemo(() => {
        if (!sellers) return [];
        switch (sortByStatus) {
            case "active":
                return sellers.filter((seller: any) => seller.is_active);
            case "inactive":
                return sellers.filter((seller: any) => !seller.is_active);
            default:
                return sellers;
        }
    }, [sellers, sortByStatus]);

    if (isLoading)
        return (
            <div className="flex-1 p-4 ml-64 mt-[72px] text-gray-800">
                Yuklanmoqda...
            </div>
        );
    if (error)
        return (
            <div className="flex-1 p-4 ml-64 mt-[72px] text-red-500">
                Xatolik yuz berdi: {(error as any)?.message}
            </div>
        );

    return (
        <div className="flex">
            <main className="flex-1 p-4 ml-[60px] md:ml-64 mt-[72px] relative transition-all duration-300">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    Seller’lar
                </h1>
                <p className="text-gray-600 mb-4">
                    Ushbu sahifada barcha seller’lar ro‘yxatini ko‘rishingiz,
                    qo‘shishingiz, tahrirlashingiz, statusini yangilashingiz va
                    o‘chirishingiz mumkin.
                </p>

                <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        <input
                            type="text"
                            placeholder="Seller qidirish (ism, email)..."
                            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                        <select
                            value={sortByStatus}
                            onChange={(e) =>
                                setSortByStatus(
                                    e.target.value as
                                        | "all"
                                        | "active"
                                        | "inactive"
                                )
                            }
                            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="all">Barcha seller’lar</option>
                            <option value="active">Faol seller’lar</option>
                            <option value="inactive">Nofaol seller’lar</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-40 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                    >
                        Seller qo‘shish
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ism
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Familiya
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Telefon
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mahsulotlar soni
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Buyurtmalar soni
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Boshqarish
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSellers?.map((seller: any) => {
                                const { productsCount, ordersCount } =
                                    getSellerStats(seller.id);
                                return (
                                    <tr
                                        key={seller.id}
                                        className="hover:bg-gray-100 cursor-pointer"
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {seller.id}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {seller.first_name}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {seller.last_name}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {seller.email}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {seller.phone || "Noma’lum"}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {productsCount} ta
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {ordersCount} ta
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() =>
                                                    handleStatusToggle(
                                                        seller.id,
                                                        seller.is_active
                                                    )
                                                }
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    seller.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {seller.is_active
                                                    ? "Faol"
                                                    : "Nofaol"}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleEditSeller(seller)
                                                    }
                                                    className="text-teal-600 hover:text-teal-700"
                                                >
                                                    Tahrirlash
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteSeller(
                                                            seller.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    O‘chirish
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md md:max-w-lg lg:max-w-xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                Yangi Seller Qo‘shish
                            </h2>
                            <form
                                onSubmit={handleAddSeller}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Ism
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="first_name"
                                        value={newSellerData.first_name}
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                first_name: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Familiya
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="last_name"
                                        value={newSellerData.last_name}
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                last_name: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={newSellerData.email}
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                email: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Parol
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={newSellerData.password}
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                password: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Telefon
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={newSellerData.phone}
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="status"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={
                                            newSellerData.is_active
                                                ? "true"
                                                : "false"
                                        }
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                is_active:
                                                    e.target.value === "true",
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="true">Faol</option>
                                        <option value="false">Nofaol</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none transition-colors duration-300"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                                    >
                                        Saqlash
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isEditModalOpen && selectedSeller && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md md:max-w-lg lg:max-w-xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                Seller’ni Tahrirlash
                            </h2>
                            <form
                                onSubmit={handleUpdateSeller}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="editFirstName"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Ism
                                    </label>
                                    <input
                                        type="text"
                                        id="editFirstName"
                                        name="first_name"
                                        value={newSellerData.first_name}
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                first_name: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="editLastName"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Familiya
                                    </label>
                                    <input
                                        type="text"
                                        id="editLastName"
                                        name="last_name"
                                        value={newSellerData.last_name}
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                last_name: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="editEmail"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="editEmail"
                                        name="email"
                                        value={newSellerData.email}
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                email: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="editPassword"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Yangi Parol (opsiyonal)
                                    </label>
                                    <input
                                        type="password"
                                        id="editPassword"
                                        name="password"
                                        value={newSellerData.password}
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                password: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="editPhone"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Telefon
                                    </label>
                                    <input
                                        type="tel"
                                        id="editPhone"
                                        name="phone"
                                        value={newSellerData.phone}
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="status"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={
                                            newSellerData.is_active
                                                ? "true"
                                                : "false"
                                        }
                                        onChange={(e) =>
                                            setNewSellerData({
                                                ...newSellerData,
                                                is_active:
                                                    e.target.value === "true",
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="true">Faol</option>
                                        <option value="false">Nofaol</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditModalOpen(false)
                                        }
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none transition-colors duration-300"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                                    >
                                        Saqlash
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
            </main>
        </div>
    );
}
