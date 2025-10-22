"use client";

import React, { useState } from "react";
import {
    useGetAdminsQuery,
    useDeleteUserMutation,
    useUpdateAdminMutation,
} from "@/api/userApi";
import { useSignupMutation } from "@/api/authApi";

export default function AdminPage() {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("superadminToken");
        if (!token) {
            window.location.href = "/superadmin/login";
        }
    }

    const {
        data: admins,
        isLoading,
        error,
        refetch,
    } = useGetAdminsQuery("admin");

    const [signup] = useSignupMutation();
    const [deleteUser] = useDeleteUserMutation();
    const [updateUser] = useUpdateAdminMutation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
    const [newAdminData, setNewAdminData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        permissions: [] as string[],
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const allPermissions = [
        "UserPost",
        "UserGetOne",
        "UserGetAll",
        "UserUpdate",
        "UserDelete",
        "BannerPost",
        "BannerGetOne",
        "BannerGetAll",
        "BannerUpdate",
        "BannerDelete",
        "WishlistPost",
        "WishlistGetOne",
        "WishlistDelete",
        "StorePost",
        "StoreGetAll",
        "StoreGetOne",
        "StoreUpdate",
        "StoreDelete",
        "StoreImageDelete",
        "ReviewPost",
        "ReviewGetAll",
        "ReviewGetOne",
        "ReviewUpdate",
        "ReviewDelete",
        "sellerProducts",
        "ProductPost",
        "ProductImagePost",
        "ProductUpdate",
        "ProductDelete",
        "ProductDeleteImage",
        "PaymentPost",
        "PaymentGetAll",
        "PaymentGetOne",
        "PaymentUpdate",
        "PaymentDelete",
        "PaymentCardPost",
        "PaymentCardGetAll",
        "PaymentCardGetOne",
        "PaymentCardUpdate",
        "PaymentCardDelete",
        "OrderPost",
        "OrderGetAll",
        "OrderGetOne",
        "OrderUpdate",
        "OrderDelete",
        "OrderItemPost",
        "OrderItemGetAll",
        "OrderItemGetOne",
        "OrderItemUpdate",
        "OrderItemUpdateStatus",
        "OrderItemDelete",
        "CategoriePost",
        "CategorieUpdate",
        "CategorieDelete",
        "CartItemPost",
        "CartItemGetAll",
        "CartItemGetOne",
        "CartItemUpdate",
        "CartItemDelete",
        "AddressGetAll",
        "AddressGetOne",
        "AddressUpdate",
        "AddressDelete",
    ];

    const handleSidebarToggle = (open: boolean) => {
        setIsSidebarOpen(open);
    };

    // Admin qo'shish funksiyasi
    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup({
                first_name: newAdminData.first_name,
                last_name: newAdminData.last_name,
                email: newAdminData.email,
                password: newAdminData.password,
                phone: newAdminData.phone,
                role: "admin",
                permissions: newAdminData.permissions,
            }).unwrap();
            refetch();
            setIsAddModalOpen(false);
            setNewAdminData({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                phone: "",
                permissions: [],
            });
            setErrorMessage("Admin muvaffaqiyatli qo'shildi!");
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("Admin qo'shishda xatolik:", error);
            setErrorMessage(
                "Admin qo'shishda xatolik yuz berdi. Qayta urinib ko'ring."
            );
        }
    };

    const handleEditAdmin = (admin: any) => {
        setSelectedAdmin(admin);
        setIsEditModalOpen(true);
        setNewAdminData({
            first_name: admin.first_name || "",
            last_name: admin.last_name || "",
            email: admin.email,
            password: "",
            phone: admin.phone || "",
            permissions: admin.permissions || [],
        });
    };

    const handleUpdateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin?.id) return;

        const body = {
            first_name: newAdminData.first_name,
            last_name: newAdminData.last_name,
            email: newAdminData.email,
            phone: newAdminData.phone,
            ...(newAdminData.password && { password: newAdminData.password }),
            permissions: newAdminData.permissions,
        };

        try {
            await updateUser({ id: selectedAdmin.id, body }).unwrap();
            refetch();
            setIsEditModalOpen(false);
            setSelectedAdmin(null);
            setNewAdminData({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                phone: "",
                permissions: [],
            });
            setErrorMessage("Admin muvaffaqiyatli yangilandi!");
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("Admin yangilashda xatolik:", error);
            setErrorMessage(
                "Admin yangilashda xatolik yuz berdi. Qayta urinib ko'ring."
            );
        }
    };

    const handleDeleteAdmin = async (adminId: number) => {
        if (
            window.confirm(
                "Adminni o'chirishni xohlaysizmi? Bu qaytarib bo'lmaydi!"
            )
        ) {
            try {
                await deleteUser({ id: adminId }).unwrap();
                refetch();
                setErrorMessage("Admin muvaffaqiyatli o'chirildi!");
                setTimeout(() => setErrorMessage(null), 3000);
            } catch (error) {
                console.error("Admin o'chirishda xatolik:", error);
                setErrorMessage(
                    "Admin o'chirishda xatolik yuz berdi. Qayta urinib ko'ring."
                );
            }
        }
    };

    const handlePermissionChange = (permission: string, value: boolean) => {
        setNewAdminData((prev) => {
            if (value) {
                return {
                    ...prev,
                    permissions: [...prev.permissions, permission],
                };
            } else {
                return {
                    ...prev,
                    permissions: prev.permissions.filter(
                        (p) => p !== permission
                    ),
                };
            }
        });
    };

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
                    Adminlar
                </h1>
                <p className="text-gray-600 mb-4">
                    Ushbu sahifada barcha adminlar ro'yxatini ko'rishingiz,
                    qo'shishingiz, tahrirlashingiz va o'chirishingiz mumkin.
                </p>

                <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <input
                        type="text"
                        placeholder="Admin qidirish (ism, email)..."
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                    >
                        Admin qo'shish
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
                                    Ruxsatlar
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Boshqarish
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins?.map((admin: any) => (
                                <tr
                                    key={admin.id}
                                    className="hover:bg-gray-100 cursor-pointer"
                                >
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {admin.id}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {admin.first_name}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {admin.last_name}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {admin.email}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {admin.phone || "Noma’lum"}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <button
                                            onClick={() =>
                                                handleEditAdmin(admin)
                                            }
                                            className="text-teal-600 hover:text-teal-700 underline"
                                        >
                                            Ruxsatlarni ko'rish/tahrirlash
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleEditAdmin(admin)
                                                }
                                                className="text-teal-600 hover:text-teal-700"
                                            >
                                                Tahrirlash
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteAdmin(admin.id)
                                                }
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                O'chirish
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md md:max-w-lg lg:max-w-xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                Yangi Admin Qo'shish
                            </h2>
                            <form
                                onSubmit={handleAddAdmin}
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
                                        value={newAdminData.first_name}
                                        onChange={(e) =>
                                            setNewAdminData({
                                                ...newAdminData,
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
                                        value={newAdminData.last_name}
                                        onChange={(e) =>
                                            setNewAdminData({
                                                ...newAdminData,
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
                                        value={newAdminData.email}
                                        onChange={(e) =>
                                            setNewAdminData({
                                                ...newAdminData,
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
                                        value={newAdminData.password}
                                        onChange={(e) =>
                                            setNewAdminData({
                                                ...newAdminData,
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
                                        value={newAdminData.phone}
                                        onChange={(e) =>
                                            setNewAdminData({
                                                ...newAdminData,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2 text-gray-700">
                                        Ruxsatlar
                                    </h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {allPermissions.map((permission) => (
                                            <label
                                                key={permission}
                                                className="flex items-center"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={newAdminData.permissions.includes(
                                                        permission
                                                    )}
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            permission,
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="mr-2"
                                                />
                                                {permission}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none transition-colors duration-300"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                                    >
                                        Saqlash
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isEditModalOpen && selectedAdmin && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md md:max-w-lg lg:max-w-xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                Adminni Tahrirlash
                            </h2>
                            <form
                                onSubmit={handleUpdateAdmin}
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
                                        value={newAdminData.first_name}
                                        onChange={(e) =>
                                            setNewAdminData({
                                                ...newAdminData,
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
                                        value={newAdminData.last_name}
                                        onChange={(e) =>
                                            setNewAdminData({
                                                ...newAdminData,
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
                                        value={newAdminData.email}
                                        onChange={(e) =>
                                            setNewAdminData({
                                                ...newAdminData,
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
                                        value={newAdminData.password}
                                        onChange={(e) =>
                                            setNewAdminData({
                                                ...newAdminData,
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
                                        value={newAdminData.phone}
                                        onChange={(e) =>
                                            setNewAdminData({
                                                ...newAdminData,
                                                phone: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2 text-gray-700">
                                        Ruxsatlar
                                    </h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {allPermissions.map((permission) => (
                                            <label
                                                key={permission}
                                                className="flex items-center"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={newAdminData.permissions.includes(
                                                        permission
                                                    )}
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            permission,
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="mr-2"
                                                />
                                                {permission}
                                            </label>
                                        ))}
                                    </div>
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
