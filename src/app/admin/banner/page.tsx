"use client";

import React, { useState, useEffect } from "react";
import {
    useAddBannerMutation,
    useDeleteBannerMutation,
    useGetAllBannerQuery,
    useUpdateBannerMutation,
} from "@/api/bannerApi";

export default function BannersPage() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            const adminToken = localStorage.getItem("adminToken");
            if (!adminToken) {
                window.location.href = "/admin/login";
            }
        }
    }, []);

    const {
        data: banners,

        refetch: refetchBanners,
    } = useGetAllBannerQuery([]);
    const [addBanner] = useAddBannerMutation();
    const [updateBanner] = useUpdateBannerMutation();
    const [deleteBanner] = useDeleteBannerMutation();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<any>(null);
    const [newBannerData, setNewBannerData] = useState({
        title: "",
        image: null as File | null,
        link: "",
        is_active: true,
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedLargeBanner, setSelectedLargeBanner] = useState<any | null>(
        null
    );
    const [searchTerm, setSearchTerm] = useState("");

    const handleAddBanner = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { title, link, image, is_active } = newBannerData;

        if (!title?.trim() || !link?.trim() || !image) {
            setErrorMessage(
                "Barcha maydonlar (sarlavha, link, rasm) to‘ldirilishi kerak!"
            );
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("link", link.trim());
        formData.append("is_active", is_active ? "true" : "false");

        if (image) {
            formData.append("image", image);
        }

        try {
            console.log("Yuborilayotgan formData:", formData);

            await addBanner(formData).unwrap();

            refetchBanners();
            setIsAddModalOpen(false);
            setNewBannerData({
                title: "",
                image: null,
                link: "",
                is_active: true,
            });

            setErrorMessage("Banner muvaffaqiyatli qo‘shildi!");
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("Banner qo‘shishda xatolik:", error);
            setErrorMessage(
                "Banner qo‘shishda xatolik yuz berdi. Qayta urinib ko‘ring."
            );
        }
    };

    const handleEditBanner = (banner: any) => {
        setSelectedBanner(banner);
        setNewBannerData({
            title: banner.title,
            image: null,
            link: banner.link,
            is_active: banner.is_active,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateBanner = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedBanner?.id) return;

        const formData = new FormData();
        formData.append("title", newBannerData.title.trim());
        formData.append("link", newBannerData.link.trim());
        formData.append("is_active", newBannerData.is_active.toString());

        if (newBannerData.image) {
            formData.append("image", newBannerData.image);
        }

        try {
            await updateBanner({
                id: selectedBanner.id,
                body: formData,
            }).unwrap();
            refetchBanners();
            setIsEditModalOpen(false);
            setSelectedBanner(null);
            setNewBannerData({
                title: "",
                image: null,
                link: "",
                is_active: true,
            });
            setErrorMessage("Banner muvaffaqiyatli yangilandi!");
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("Banner yangilashda xatolik:", error);
            setErrorMessage(
                "Banner yangilashda xatolik yuz berdi. Qayta urinib ko‘ring."
            );
        }
    };

    const handleDeleteBanner = async (bannerId: number) => {
        if (
            window.confirm(
                "Banner o‘chirishni xohlaysizmi? Bu qaytarib bo‘lmaydi!"
            )
        ) {
            try {
                await deleteBanner({ id: bannerId }).unwrap();
                refetchBanners();
                setErrorMessage("Banner muvaffaqiyatli o‘chirildi!");
                setTimeout(() => setErrorMessage(null), 3000);
                if (selectedLargeBanner?.id === bannerId) {
                    setSelectedLargeBanner(
                        banners.find((b: any) => b.id !== bannerId) || null
                    );
                }
            } catch (error) {
                console.error("Banner o‘chirishda xatolik:", error);
                setErrorMessage(
                    "Banner o‘chirishda xatolik yuz berdi. Qayta urinib ko‘ring."
                );
            }
        }
    };

    const handleToggleStatus = async (bannerId: number, newStatus: boolean) => {
        try {
            await updateBanner({
                id: bannerId,
                body: { is_active: newStatus },
            }).unwrap();
            refetchBanners();
            setErrorMessage(
                `Banner statusi ${
                    newStatus ? "faol" : "nofaol"
                } holatga o‘zgartirildi!`
            );
            setTimeout(() => setErrorMessage(null), 3000);
        } catch (error) {
            console.error("Banner statusini yangilashda xatolik:", error);
            setErrorMessage(
                "Banner statusini yangilashda xatolik yuz berdi. Qayta urinib ko‘ring."
            );
        }
    };

    const handleSelectLargeBanner = (banner: any) => {
        setSelectedLargeBanner(banner);
    };

    const filteredBanners =
        banners?.filter((banner: any) =>
            banner.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

    return (
        <div className="flex">
            <main className="flex-1 p-4 ml-[60px] md:ml-64 mt-[72px] relative transition-all duration-300">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    Bannerlar
                </h1>
                <p className="text-gray-600 mb-4">
                    Ushbu sahifada barcha bannerlarni ko‘rishingiz,
                    qo‘shishingiz, tahrirlashingiz va o‘chirishingiz mumkin.
                </p>

                <div className="mb-8 flex flex-col md:flex-row gap-6 bg-white p-4 rounded-lg shadow-md">
                    <div className="w-full md:w-8/12 h-[600px] relative rounded-lg overflow-hidden">
                        {selectedLargeBanner ? (
                            <img
                                src={`https://desirable-stillness-production.up.railway.app/banners/${selectedLargeBanner.image}`}
                                alt={selectedLargeBanner.title}
                                className="rounded-lg"
                            />
                        ) : banners && banners.length > 0 ? (
                            <img
                                src={`https://desirable-stillness-production.up.railway.app/banners/${banners[0].image}`}
                                alt={banners[0].title}
                                className="rounded-lg"
                            />
                        ) : (
                            <p className="text-gray-500 text-center h-full flex items-center justify-center">
                                Bannerlar mavjud emas.
                            </p>
                        )}
                        {selectedLargeBanner && (
                            <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white p-3 rounded-lg shadow-md">
                                <p className="text-lg font-semibold">
                                    {selectedLargeBanner.title}
                                </p>
                                <p className="text-sm">
                                    Link: {selectedLargeBanner.link}
                                </p>
                                <p className="text-sm">
                                    Holati:{" "}
                                    {selectedLargeBanner.is_active
                                        ? "Faol"
                                        : "Nofaol"}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-4/12 h-[600px] overflow-y-auto rounded-lg shadow-inner">
                        {filteredBanners.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredBanners.map((banner: any) => (
                                    <div
                                        key={banner.id}
                                        className="relative w-full h-40 rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-all duration-300"
                                        onClick={() =>
                                            handleSelectLargeBanner(banner)
                                        }
                                    >
                                        <img
                                            src={`https://desirable-stillness-production.up.railway.app/banners/${banner.image}`}
                                            alt={banner.title}
                                            className="rounded-lg"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white p-1 rounded text-xs">
                                            {banner.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center">
                                Bannerlar topilmadi.
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <input
                        type="text"
                        placeholder="Banner qidirish (nom bo‘yicha)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        Banner qo‘shish
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
                                    Sarlavha
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Link
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Holati
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Boshqarish
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBanners.map((banner: any) => (
                                <tr
                                    key={banner.id}
                                    className="hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                >
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {banner.id}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {banner.title}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <a
                                            href={banner.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-teal-600 hover:text-teal-700 underline"
                                        >
                                            {banner.link}
                                        </a>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() =>
                                                handleToggleStatus(
                                                    banner.id,
                                                    !banner.is_active
                                                )
                                            }
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                banner.is_active
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : "bg-red-100 text-red-800 hover:bg-red-200"
                                            } transition-all duration-200`}
                                        >
                                            {banner.is_active
                                                ? "Faol"
                                                : "Nofaol"}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleEditBanner(banner)
                                                }
                                                className="text-teal-600 hover:text-teal-700 px-2 py-1 rounded-md hover:bg-teal-100 transition-all duration-200"
                                            >
                                                Tahrirlash
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteBanner(
                                                        banner.id
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-100 transition-all duration-200"
                                            >
                                                O‘chirish
                                            </button>
                                        </div>
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
                        } px-4 py-2 bg-opacity-10 rounded-md`}
                    >
                        {errorMessage}
                    </p>
                )}

                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md md:max-w-lg lg:max-w-xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
                                Yangi Banner Qo‘shish
                            </h2>
                            <form
                                onSubmit={handleAddBanner}
                                className="space-y-4"
                                encType="multipart/form-data"
                            >
                                <div>
                                    <label
                                        htmlFor="bannerTitle"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Sarlavha
                                    </label>
                                    <input
                                        type="text"
                                        id="bannerTitle"
                                        value={newBannerData.title}
                                        onChange={(e) =>
                                            setNewBannerData({
                                                ...newBannerData,
                                                title: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="bannerImage"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Rasm
                                    </label>
                                    <input
                                        type="file"
                                        id="bannerImage"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (
                                                file &&
                                                file.size > 5 * 1024 * 1024
                                            ) {
                                                setErrorMessage(
                                                    "Rasm hajmi 5 MB dan oshmasligi kerak!"
                                                );
                                                setTimeout(
                                                    () => setErrorMessage(null),
                                                    3000
                                                );
                                                return;
                                            }
                                            setNewBannerData({
                                                ...newBannerData,
                                                image: file || null,
                                            });
                                        }}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="bannerLink"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Link
                                    </label>
                                    <input
                                        type="text"
                                        id="bannerLink"
                                        value={newBannerData.link}
                                        onChange={(e) =>
                                            setNewBannerData({
                                                ...newBannerData,
                                                link: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="bannerStatus"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Holati
                                    </label>
                                    <select
                                        id="bannerStatus"
                                        value={
                                            newBannerData.is_active
                                                ? "true"
                                                : "false"
                                        }
                                        onChange={(e) =>
                                            setNewBannerData({
                                                ...newBannerData,
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
                                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        Saqlash
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isEditModalOpen && selectedBanner && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md md:max-w-lg lg:max-w-xl">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
                                Banner Tahrirlash
                            </h2>
                            <form
                                onSubmit={handleUpdateBanner}
                                className="space-y-4"
                                encType="multipart/form-data"
                            >
                                <div>
                                    <label
                                        htmlFor="editBannerTitle"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Sarlavha
                                    </label>
                                    <input
                                        type="text"
                                        id="editBannerTitle"
                                        value={newBannerData.title}
                                        onChange={(e) =>
                                            setNewBannerData({
                                                ...newBannerData,
                                                title: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="editBannerImage"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Yangi Rasm (opsiyonal)
                                    </label>
                                    <input
                                        type="file"
                                        id="editBannerImage"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (
                                                file &&
                                                file.size > 5 * 1024 * 1024
                                            ) {
                                                setErrorMessage(
                                                    "Rasm hajmi 5 MB dan oshmasligi kerak!"
                                                );
                                                setTimeout(
                                                    () => setErrorMessage(null),
                                                    3000
                                                );
                                                return;
                                            }
                                            setNewBannerData({
                                                ...newBannerData,
                                                image: file || null,
                                            });
                                        }}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                    />
                                    {selectedBanner.image && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600">
                                                Joriy rasm:
                                            </p>
                                            <img
                                                src={`https://desirable-stillness-production.up.railway.app/banners/${selectedBanner.image}`}
                                                alt={selectedBanner.title}
                                                width={100}
                                                height={100}
                                                className="rounded-md object-cover border border-gray-300"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="editBannerLink"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Link
                                    </label>
                                    <input
                                        type="text"
                                        id="editBannerLink"
                                        value={newBannerData.link}
                                        onChange={(e) =>
                                            setNewBannerData({
                                                ...newBannerData,
                                                link: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="editBannerStatus"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Holati
                                    </label>
                                    <select
                                        id="editBannerStatus"
                                        value={
                                            newBannerData.is_active
                                                ? "true"
                                                : "false"
                                        }
                                        onChange={(e) =>
                                            setNewBannerData({
                                                ...newBannerData,
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
                                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 shadow-md hover:shadow-lg"
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
