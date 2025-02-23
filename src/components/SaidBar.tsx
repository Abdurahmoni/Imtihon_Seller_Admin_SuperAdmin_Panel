"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAddStoreMutation, useGetStorMeQuery } from "@/api/storeApi";
import { usePathname } from "next/navigation";

export default function SaidBar({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const pathname = usePathname();

    const [isSecondSidebarOpen, setIsSecondSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [storeData, setStoreData] = useState({
        name: "",
        description: "",
        logo: null as File | null,
        street: "",
        city: "",
        state: "",
    });
    const { data: stores, refetch } = useGetStorMeQuery([]);
    const [addStore] = useAddStoreMutation();

    const storedStore =
        typeof window !== "undefined"
            ? JSON.parse(
                  localStorage.getItem("stores") == "undefined"
                      ? "[]"
                      : localStorage.getItem("stores") || "[]"
              )
            : null;

    const toggleSecondBar = () => {
        setIsSecondSidebarOpen(!isSecondSidebarOpen);
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setStoreData({ ...storeData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setStoreData({ ...storeData, logo: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Yangi do‘kon ma’lumotlari:", storeData);

        const formData = new FormData();
        formData.append("name", storeData.name);
        formData.append("description", storeData.description);
        formData.append("street", storeData.street);
        formData.append("city", storeData.city);
        formData.append("state", storeData.state);

        if (storeData.logo) {
            formData.append("logo", storeData.logo);
        }

        try {
            await addStore(formData).unwrap();
            refetch();
            setIsModalOpen(false);
            setStoreData({
                name: "",
                description: "",
                logo: null,
                street: "",
                city: "",
                state: "",
            });
        } catch (error) {
            console.error("Do'kon qo'shishda xatolik:", error);
        }
    };

    const handleStoreSelect = (store: any) => {
        localStorage.setItem("stores", JSON.stringify(store));
        refetch();
    };

    if (!isOpen) return null;

    return (
        <div>
            {pathname.split("/")[1] === "seller" ? (
                <div className="flex">
                    <div className="fixed inset-y-0 left-0 w-64 h-screen mt-[72px] bg-gray-800 text-white p-4 z-50 transform transition-transform duration-300 ease-in-out">
                        <nav>
                            <ul className="space-y-4">
                                <button
                                    className="text-lg font-semibold ml-2 mb-4 w-full flex items-center gap-2"
                                    onClick={toggleSecondBar}
                                >
                                    {stores?.length > 0
                                        ? storedStore?.name
                                        : "Do'kon qo'shish"}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`${
                                            isSecondSidebarOpen && "rotate-180"
                                        } transition-transform h-6 w-6`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                                <li>
                                    <Link
                                        href="/seller"
                                        className="block p-2 hover:bg-gray-700 rounded"
                                        onClick={onClose}
                                    >
                                        Bosh sahifa
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/seller/orders"
                                        className="block p-2 hover:bg-gray-700 rounded"
                                        onClick={onClose}
                                    >
                                        Buyurtmalar
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/seller/products"
                                        className="block p-2 hover:bg-gray-700 rounded"
                                        onClick={onClose}
                                    >
                                        Mahsulotlar
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/seller/settings"
                                        className="block p-2 hover:bg-gray-700 rounded"
                                        onClick={onClose}
                                    >
                                        Sozlamalar
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        className="block p-2 w-full text-left hover:bg-gray-700 rounded"
                                        onClick={() => {
                                            localStorage.removeItem(
                                                "sellerToken"
                                            );
                                            localStorage.removeItem(
                                                "refreshToken"
                                            );
                                            localStorage.removeItem("seller");
                                            localStorage.removeItem("stores");

                                            window.location.href =
                                                "/seller/login";
                                        }}
                                    >
                                        Chiqish
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {isSecondSidebarOpen && (
                        <div className="fixed inset-y-0 left-64 w-64 h-screen mt-[72px] bg-gray-700 text-white p-4 z-50 transform transition-transform duration-300 ease-in-out">
                            <nav className="mt-4">
                                <ul className="space-y-4 mb-4">
                                    {stores?.map((store: any) => (
                                        <li key={store.id}>
                                            <button
                                                className="p-2 hover:bg-gray-600 w-full rounded flex items-center"
                                                onClick={() =>
                                                    handleStoreSelect(store)
                                                }
                                            >
                                                <img
                                                    src={`https://desirable-stillness-production.up.railway.app/store/${store.logo}`}
                                                    alt={store.name}
                                                    className="w-8 h-8 rounded-full mr-2"
                                                />
                                                {store.name}
                                                {storedStore &&
                                                    store.id ===
                                                        storedStore.id && (
                                                        <span
                                                            className={`w-4 h-4 rounded-full ${
                                                                store.isActive
                                                                    ? "bg-red-500"
                                                                    : "bg-green-500"
                                                            } ml-auto`}
                                                        ></span>
                                                    )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className="p-2 ml-2 hover:bg-gray-600 rounded w-full flex items-center gap-2"
                                    onClick={toggleModal}
                                >
                                    <span className="text-lg font-semibold hover:rotate-90 transition-all">
                                        +
                                    </span>
                                    Dokon qo'shish
                                </button>
                            </nav>
                        </div>
                    )}

                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                    Yangi Do‘kon Qo‘shish
                                </h2>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4 text-black"
                                >
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Do'kon Nomi
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={storeData.name}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="description"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Tavsif
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={storeData.description}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="logo"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Logo (Rasm)
                                        </label>
                                        <input
                                            type="file"
                                            id="logo"
                                            name="logo"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="street"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Ko‘cha
                                        </label>
                                        <input
                                            type="text"
                                            id="street"
                                            name="street"
                                            value={storeData.street}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="city"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Shahar
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={storeData.city}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="state"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Viloyat
                                        </label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={storeData.state}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={toggleModal}
                                            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none"
                                        >
                                            Bekor qilish
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                        >
                                            Saqlash
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ) : pathname.split("/")[1] === "admin" ? (
                <div className="flex">
                    <div className="fixed inset-y-0 left-0 w-64 h-screen mt-[72px] bg-gray-800 text-white p-4 z-50 transform transition-transform duration-300 ease-in-out">
                        <nav>
                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        href="/superadmin"
                                        className="block p-2 hover:bg-gray-700 rounded"
                                        onClick={onClose}
                                    >
                                        Bosh sahifa
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        href="/admin/seller"
                                        className="block p-2 hover:bg-gray-700 rounded"
                                        onClick={onClose}
                                    >
                                        Sotuvchilar
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/admin/orders"
                                        className="block p-2 hover:bg-gray-700 rounded"
                                        onClick={onClose}
                                    >
                                        Buyurtmalar
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/admin/categorie"
                                        className="block p-2 hover:bg-gray-700 rounded"
                                        onClick={onClose}
                                    >
                                        Categories
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/admin/banner"
                                        className="block p-2 hover:bg-gray-700 rounded"
                                        onClick={onClose}
                                    >
                                        Banners
                                    </Link>
                                </li>

                                <li>
                                    <button
                                        className="block p-2 w-full text-left hover:bg-gray-700 rounded"
                                        onClick={() => {
                                            localStorage.removeItem(
                                                "adminToken"
                                            );

                                            localStorage.removeItem("admin");

                                            window.location.href =
                                                "/admin/login";
                                        }}
                                    >
                                        Chiqish
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            ) : (
                pathname.split("/")[1] === "superadmin" && (
                    <div className="flex">
                        <div className="fixed inset-y-0 left-0 w-64 h-screen mt-[72px] bg-gray-800 text-white p-4 z-50 transform transition-transform duration-300 ease-in-out">
                            <nav>
                                <ul className="space-y-4">
                                    <li>
                                        <Link
                                            href="/superadmin"
                                            className="block p-2 hover:bg-gray-700 rounded"
                                            onClick={onClose}
                                        >
                                            Bosh sahifa
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/superadmin/admin"
                                            className="block p-2 hover:bg-gray-700 rounded"
                                            onClick={onClose}
                                        >
                                            Adminlar
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/superadmin/seller"
                                            className="block p-2 hover:bg-gray-700 rounded"
                                            onClick={onClose}
                                        >
                                            Sotuvchilar
                                        </Link>
                                    </li>

                                    <li>
                                        <button
                                            className="block p-2 w-full text-left hover:bg-gray-700 rounded"
                                            onClick={() => {
                                                localStorage.removeItem(
                                                    "superadminToken"
                                                );

                                                localStorage.removeItem(
                                                    "superadmin"
                                                );

                                                window.location.href =
                                                    "/superadmin/login";
                                            }}
                                        >
                                            Chiqish
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
