"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useGetOneUserQuery, useUpdateUserMutation } from "@/api/userApi";
import { useUpdateStoreMutation, useDeleteStoreMutation } from "@/api/storeApi";

export default function SettingsPage() {
    if (typeof window !== "undefined") {
        if (!localStorage.getItem("sellerToken")) {
            window.location.href = "/seller/login";
        }
    }
    const {
        data: seller,
        isLoading,
        error,
        refetch: refetchUser,
    } = useGetOneUserQuery([]);
    const [updateUser] = useUpdateUserMutation();
    const [updateStore] = useUpdateStoreMutation();
    const [deleteStore] = useDeleteStoreMutation();

    const [userData, setUserData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
    });
    const [storeData, setStoreData] = useState({
        name: "",
        description: "",
        logo: "" as File | string,
        street: "",
        city: "",
        state: "",
    });
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [isEditingStore, setIsEditingStore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [currentStoreId, setCurrentStoreId] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const sellerToken = localStorage.getItem("sellerToken");
            if (!sellerToken) {
                window.location.href = "/login";
                return;
            }
            const storedStores = localStorage.getItem("stores");
            if (storedStores) {
                try {
                    const stores = JSON.parse(storedStores);
                    const currentStore = Array.isArray(stores)
                        ? stores[0]
                        : stores;
                    if (
                        currentStore &&
                        typeof currentStore === "object" &&
                        currentStore.id
                    ) {
                        setCurrentStoreId(currentStore.id);
                        setStoreData({
                            name: currentStore.name || "",
                            description: currentStore.description || "",
                            logo: currentStore.logo || "",
                            street: currentStore.street || "",
                            city: currentStore.city || "",
                            state: currentStore.state || "",
                        });
                    } else {
                        setErrorMessage(
                            "Store ma’lumotlari noto‘g‘ri formatda!"
                        );
                    }
                } catch (error) {
                    console.error(
                        "LocalStorage’dan store o‘qishda xatolik:",
                        error
                    );
                    setErrorMessage(
                        "Store ma’lumotlarini o‘qishda xatolik yuz berdi."
                    );
                }
            }
        }
    }, []);

    useEffect(() => {
        if (seller) {
            setUserData({
                first_name: seller.first_name || "",
                last_name: seller.last_name || "",
                email: seller.email || "",
                password: "",
                phone: seller.phone || "",
            });
        }
    }, [seller]);

    const handleUserInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
        setErrorMessage(null);
    };

    const handleStoreInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (name === "logo") {
            const file = (e.target as HTMLInputElement).files?.[0];
            setStoreData((prev) => ({
                ...prev,
                [name]: file || (value as string),
            }));
        } else {
            setStoreData((prev) => ({ ...prev, [name]: value }));
        }
        setErrorMessage(null);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone: userData.phone,
            ...(userData.password && { password: userData.password }),
        };

        try {
            await updateUser(body).unwrap();
            setIsEditingUser(false);
            refetchUser();
            setErrorMessage("Hisob sozlamalari muvaffaqiyatli yangilandi!");
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("User yangilashda xatolik:", error);
            setErrorMessage("User sozlamalarni yangilashda xatolik yuz berdi.");
        }
    };

    const handleUpdateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStoreId) {
            setErrorMessage("Hozirgi dokon aniqlanmadi!");
            return;
        }

        const formData = new FormData();
        formData.append("name", storeData.name);
        formData.append("description", storeData.description);
        if (storeData.logo instanceof File) {
            formData.append("logo", storeData.logo);
        } else if (typeof storeData.logo === "string") {
            formData.append("logo", storeData.logo);
        }
        formData.append("street", storeData.street);
        formData.append("city", storeData.city);
        formData.append("state", storeData.state);

        try {
            await updateStore({ id: currentStoreId, body: formData }).unwrap();
            setIsEditingStore(false);
            setErrorMessage("Dokon sozlamalari muvaffaqiyatli yangilandi!");
            setTimeout(() => setErrorMessage(null), 3000);
            if (typeof window !== "undefined") {
                const storedStores = localStorage.getItem("stores") || "[]";
                const stores = JSON.parse(storedStores);
                const updatedStores = Array.isArray(stores)
                    ? stores.map((store: any) =>
                          store.id === currentStoreId
                              ? {
                                    ...store,
                                    name: storeData.name,
                                    description: storeData.description,
                                    logo:
                                        storeData.logo instanceof File
                                            ? storeData.logo.name
                                            : storeData.logo,
                                    street: storeData.street,
                                    city: storeData.city,
                                    state: storeData.state,
                                }
                              : store
                      )
                    : [
                          {
                              id: currentStoreId,
                              name: storeData.name,
                              description: storeData.description,
                              logo:
                                  storeData.logo instanceof File
                                      ? storeData.logo.name
                                      : storeData.logo,
                              street: storeData.street,
                              city: storeData.city,
                              state: storeData.state,
                          },
                      ];
                localStorage.setItem("stores", JSON.stringify(updatedStores));
            }
            refetchUser();
        } catch (error) {
            console.error("Store yangilashda xatolik:", error);
            setErrorMessage(
                "Dokon sozlamalarni yangilashda xatolik yuz berdi."
            );
        }
    };

    const handleDeleteStore = async () => {
        if (!currentStoreId) {
            setErrorMessage("Hozirgi dokon aniqlanmadi!");
            return;
        }

        if (
            window.confirm(
                "Dokonni o‘chirishni xohlaysizmi? Bu qaytarib bo‘lmaydi!"
            )
        ) {
            try {
                await deleteStore({ id: currentStoreId }).unwrap();
                setErrorMessage("Dokon muvaffaqiyatli o‘chirildi!");
                setTimeout(() => setErrorMessage(null), 3000);
                if (typeof window !== "undefined") {
                    const storedStores = localStorage.getItem("stores") || "[]";
                    const stores = JSON.parse(storedStores);
                    const updatedStores = Array.isArray(stores)
                        ? stores.filter(
                              (store: any) => store.id !== currentStoreId
                          )
                        : [];
                    localStorage.setItem(
                        "stores",
                        JSON.stringify(updatedStores)
                    );
                    if (updatedStores.length === 0) {
                        setCurrentStoreId(null);
                        setStoreData({
                            name: "",
                            description: "",
                            logo: "",
                            street: "",
                            city: "",
                            state: "",
                        });
                    } else {
                        setCurrentStoreId(updatedStores[0]?.id || null);
                        setStoreData({
                            name: updatedStores[0]?.name || "",
                            description: updatedStores[0]?.description || "",
                            logo: updatedStores[0]?.logo || "",
                            street: updatedStores[0]?.street || "",
                            city: updatedStores[0]?.city || "",
                            state: updatedStores[0]?.state || "",
                        });
                    }
                }
                refetchUser();
            } catch (error) {
                console.error("Dokon o‘chirishda xatolik:", error);
                setErrorMessage("Dokonni o‘chirishda xatolik yuz berdi.");
            }
        }
    };

    const handleCancelUser = () => {
        if (seller) {
            setUserData({
                first_name: seller.first_name || "",
                last_name: seller.last_name || "",
                email: seller.email || "",
                password: "",
                phone: seller.phone || "",
            });
        }
        setIsEditingUser(false);
        setErrorMessage(null);
    };

    const handleCancelStore = () => {
        if (currentStoreId) {
            const storedStores = localStorage.getItem("stores") || "[]";
            const stores = JSON.parse(storedStores);
            const currentStore = Array.isArray(stores)
                ? stores.find((s: any) => s.id === currentStoreId)
                : stores;
            setStoreData({
                name: currentStore?.name || "",
                description: currentStore?.description || "",
                logo: currentStore?.logo || "",
                street: currentStore?.street || "",
                city: currentStore?.city || "",
                state: currentStore?.state || "",
            });
        }
        setIsEditingStore(false);
        setErrorMessage(null);
    };

    return (
        <div className="p-4 ml-64 mt-40 relative transition-all duration-300">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">
                    Sozlamalar
                </h1>
                <p className="text-gray-600 mb-6">
                    Ushbu sahifada hisob va dokon sozlamalaringizni ko‘rishingiz
                    va yangilashingiz mumkin.
                </p>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                        Hisob Sozlamalari
                    </h2>
                    <form onSubmit={handleUpdateUser} className="space-y-6">
                        <div>
                            <label
                                htmlFor="first_name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Ism
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={userData.first_name}
                                onChange={handleUserInputChange}
                                disabled={!isEditingUser}
                                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                    !isEditingUser
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                }`}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="last_name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Familiya
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={userData.last_name}
                                onChange={handleUserInputChange}
                                disabled={!isEditingUser}
                                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                    !isEditingUser
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                }`}
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
                                value={userData.email}
                                onChange={handleUserInputChange}
                                disabled={!isEditingUser}
                                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                    !isEditingUser
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                }`}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Yangi Parol (opsiyonal)
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={userData.password}
                                onChange={handleUserInputChange}
                                disabled={!isEditingUser}
                                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                    !isEditingUser
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                }`}
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
                                value={userData.phone}
                                onChange={handleUserInputChange}
                                disabled={!isEditingUser}
                                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                    !isEditingUser
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                }`}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            {isEditingUser ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleCancelUser}
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
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditingUser(true)}
                                    className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                                >
                                    Tahrirlash
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {currentStoreId && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                            Dokon Sozlamalari
                        </h2>
                        <form
                            onSubmit={handleUpdateStore}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="storeName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Dokon Nomi
                                </label>
                                <input
                                    type="text"
                                    id="storeName"
                                    name="name"
                                    value={storeData.name}
                                    onChange={handleStoreInputChange}
                                    disabled={!isEditingStore}
                                    className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                        !isEditingStore
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : ""
                                    }`}
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="storeDescription"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Dokon Tavsifi
                                </label>
                                <textarea
                                    id="storeDescription"
                                    name="description"
                                    value={storeData.description}
                                    onChange={handleStoreInputChange}
                                    disabled={!isEditingStore}
                                    className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                        !isEditingStore
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : ""
                                    }`}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="storeLogo"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Dokon Logosi (Rasm)
                                </label>
                                <input
                                    type="file"
                                    id="storeLogo"
                                    name="logo"
                                    accept="image/*"
                                    onChange={handleStoreInputChange}
                                    disabled={!isEditingStore}
                                    className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 ${
                                        !isEditingStore
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : ""
                                    }`}
                                />
                                {typeof storeData.logo === "string" &&
                                    storeData.logo && (
                                        <img
                                            src={`https://desirable-stillness-production.up.railway.app/store/${storeData.logo}`}
                                            alt="Dokon logosi"
                                            className="mt-2 w-32 h-32 object-cover rounded"
                                        />
                                    )}
                            </div>
                            <div>
                                <label
                                    htmlFor="storeStreet"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Ko‘cha
                                </label>
                                <input
                                    type="text"
                                    id="storeStreet"
                                    name="street"
                                    value={storeData.street}
                                    onChange={handleStoreInputChange}
                                    disabled={!isEditingStore}
                                    className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                        !isEditingStore
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : ""
                                    }`}
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="storeCity"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Shahar
                                </label>
                                <input
                                    type="text"
                                    id="storeCity"
                                    name="city"
                                    value={storeData.city}
                                    onChange={handleStoreInputChange}
                                    disabled={!isEditingStore}
                                    className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                        !isEditingStore
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : ""
                                    }`}
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="storeState"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Viloyat
                                </label>
                                <input
                                    type="text"
                                    id="storeState"
                                    name="state"
                                    value={storeData.state}
                                    onChange={handleStoreInputChange}
                                    disabled={!isEditingStore}
                                    className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 ${
                                        !isEditingStore
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : ""
                                    }`}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                {isEditingStore ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCancelStore}
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
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsEditingStore(true)
                                            }
                                            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                                        >
                                            Tahrirlash
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeleteStore}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                                        >
                                            Dokonni o‘chirish
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
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
            </div>
        </div>
    );
}
