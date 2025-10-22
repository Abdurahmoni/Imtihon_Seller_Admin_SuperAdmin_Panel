"use client";

import React, { useState } from "react";
import {
    useAddCategorieMutation,
    useDeleteCategorieMutation,
    useGetAllCategorieQuery,
    useUpdateCategorieMutation,
} from "@/api/categorieApi";

export default function CategoriesPage() {
    if (typeof window !== "undefined") {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
            window.location.href = "/admin/login";
        }
    }
    const {
        data: categories,
        isLoading,
        error,
        refetch,
    } = useGetAllCategorieQuery([]);
    const [addCategorie] = useAddCategorieMutation();
    const [updateCategorie] = useUpdateCategorieMutation();
    const [deleteCategorie] = useDeleteCategorieMutation();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [newCategoryData, setNewCategoryData] = useState({
        name: "",
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showProducts, setShowProducts] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addCategorie({ name: newCategoryData.name }).unwrap();
            refetch();
            setIsAddModalOpen(false);
            setNewCategoryData({ name: "" });
            setErrorMessage("Kategoriya muvaffaqiyatli qo'shildi!");
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("Kategoriya qo'shishda xatolik:", error);
            setErrorMessage(
                "Kategoriya qo'shishda xatolik yuz berdi. Qayta urinib ko'ring."
            );
        }
    };
    const handleEditCategory = (category: any) => {
        setSelectedCategory(category);
        setNewCategoryData({ name: category.name });
        setIsEditModalOpen(true);
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory?.id) return;

        try {
            await updateCategorie({
                id: selectedCategory.id,
                body: { name: newCategoryData.name },
            }).unwrap();
            refetch();
            setIsEditModalOpen(false);
            setSelectedCategory(null);
            setNewCategoryData({ name: "" });
            setErrorMessage("Kategoriya muvaffaqiyatli yangilandi!");
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("Kategoriya yangilashda xatolik:", error);
            setErrorMessage(
                "Kategoriya yangilashda xatolik yuz berdi. Qayta urinib ko'ring."
            );
        }
    };

    const handleDeleteCategory = async (categoryId: number) => {
        if (
            window.confirm(
                "Kategoriyani o'chirishni xohlaysizmi? Bu qaytarib bo'lmaydi!"
            )
        ) {
            try {
                await deleteCategorie({ id: categoryId }).unwrap();
                refetch();
                setErrorMessage("Kategoriya muvaffaqiyatli o'chirildi!");
                setTimeout(() => setErrorMessage(null), 3000);
            } catch (error) {
                console.error("Kategoriya o'chirishda xatolik:", error);
                setErrorMessage(
                    "Kategoriya o'chirishda xatolik yuz berdi. Qayta urinib ko'ring."
                );
            }
        }
    };

    const handleToggleProducts = (categoryId: number) => {
        setShowProducts(showProducts === categoryId ? null : categoryId);
    };

    return (
        <div className="flex">
            <main className="flex-1 p-4 ml-[60px] md:ml-64 mt-[72px] relative transition-all duration-300">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    Kategoriyalar
                </h1>
                <p className="text-gray-600 mb-4">
                    Ushbu sahifada barcha kategoriyalarni ko'rishingiz,
                    qo'shishingiz, tahrirlashingiz va o'chirishingiz mumkin.
                </p>

                <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <input
                        type="text"
                        placeholder="Kategoriya qidirish (nom bo'yicha)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                    >
                        Kategoriya qo'shish
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
                                    Nomi
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mahsulotlar
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Boshqarish
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories?.map((category: any) => (
                                <React.Fragment key={category.id}>
                                    <tr className="hover:bg-gray-100 cursor-pointer">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {category.id}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {category.name}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <button
                                                onClick={() =>
                                                    handleToggleProducts(
                                                        category.id
                                                    )
                                                }
                                                className="text-teal-600 hover:text-teal-700 underline"
                                            >
                                                {showProducts === category.id
                                                    ? "Yopish"
                                                    : "Mahsulotlarni ko'rish"}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleEditCategory(
                                                            category
                                                        )
                                                    }
                                                    className="text-teal-600 hover:text-teal-700"
                                                >
                                                    Tahrirlash
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            category.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    O'chirish
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {showProducts === category.id && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-4"
                                            >
                                                <div className="bg-gray-50 p-4 rounded-lg ">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                        {category.name}{" "}
                                                        Kategoriyasidagi
                                                        Mahsulotlar
                                                    </h3>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        ID
                                                                    </th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Nomi
                                                                    </th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Narx
                                                                    </th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Rasmlar
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {category.products?.map(
                                                                    (
                                                                        product: any
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                product.id
                                                                            }
                                                                            className="hover:bg-gray-100"
                                                                        >
                                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                                {
                                                                                    product.id
                                                                                }
                                                                            </td>
                                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                                {
                                                                                    product.name
                                                                                }
                                                                            </td>
                                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                                {
                                                                                    product.price
                                                                                }{" "}
                                                                                UZS
                                                                            </td>
                                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                                <div className="flex gap-2">
                                                                                    {product.image?.map(
                                                                                        (
                                                                                            image: string,
                                                                                            index: number
                                                                                        ) => (
                                                                                            <img
                                                                                                key={
                                                                                                    index
                                                                                                }
                                                                                                src={`https://imtihonbackend-production-235e.up.railway.app/product/${image}`}
                                                                                                alt={`${
                                                                                                    product.name
                                                                                                } rasmi ${
                                                                                                    index +
                                                                                                    1
                                                                                                }`}
                                                                                                width={
                                                                                                    50
                                                                                                }
                                                                                                height={
                                                                                                    50
                                                                                                }
                                                                                                className="rounded-md w-12 h-12 object-cover"
                                                                                            />
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
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

                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md md:max-w-lg">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                Yangi Kategoriya Qo'shish
                            </h2>
                            <form
                                onSubmit={handleAddCategory}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="categoryName"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nomi
                                    </label>
                                    <input
                                        type="text"
                                        id="categoryName"
                                        value={newCategoryData.name}
                                        onChange={(e) =>
                                            setNewCategoryData({
                                                name: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
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

                {isEditModalOpen && selectedCategory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md md:max-w-lg">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                Kategoriyani Tahrirlash
                            </h2>
                            <form
                                onSubmit={handleUpdateCategory}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="editCategoryName"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nomi
                                    </label>
                                    <input
                                        type="text"
                                        id="editCategoryName"
                                        value={newCategoryData.name}
                                        onChange={(e) =>
                                            setNewCategoryData({
                                                name: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditModalOpen(false)
                                        }
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
            </main>
        </div>
    );
}
