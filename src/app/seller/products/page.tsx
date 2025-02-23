"use client";
import React, { useState, useEffect } from "react";
import {
    useAddProductMutation,
    useGetProductsSellerQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useAddProdactImageMutation,
    useDeleteProductImageMutation,
} from "@/api/productApi";
import { useGetAllCategorieQuery } from "@/api/categorieApi";

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [store, setStore] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const sellerToken = localStorage.getItem("sellerToken");
            if (!sellerToken) {
                window.location.href = "/seller/login";
                return;
            }
            const storedData = localStorage.getItem("stores");
            if (storedData) {
                const stores = JSON.parse(storedData);
                setStore(stores);
            }
        }
    }, []);

    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        image: [] as File[],
        seller_id: 0,
        store_id: 0,
        category_id: 1,
    });
    const [editingProductId, setEditingProductId] = useState<number | null>(
        null
    );
    const [newImages, setNewImages] = useState<File[]>([]);
    const [showSaveButton, setShowSaveButton] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (store) {
            setProductData((prev) => ({
                ...prev,
                seller_id: store.seller?.id,
                store_id: store.id,
            }));
        }
    }, [store]);

    const {
        data: products,

        refetch,
    } = useGetProductsSellerQuery([]);
    const [addProduct] = useAddProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    const [deleteProduct] = useDeleteProductMutation();
    const [addProductImage] = useAddProdactImageMutation();
    const [deleteProductImage] = useDeleteProductImageMutation();

    // const categories =
    //     products?.reduce((acc: any[], product: any) => {
    //         if (
    //             product.category?.name &&
    //             !acc.find((cat) => cat.name === product.category.name)
    //         ) {
    //             const maxId = Math.max(...acc.map((cat) => cat.id || 0), 0) + 1;
    //             acc.push({ name: product.category.name, id: maxId });
    //         }
    //         return acc;
    //     }, []) || [];
    const { data: categories } = useGetAllCategorieQuery([]);
    console.log(categories);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setProductData({
            ...productData,
            [name]: name === "price" ? parseFloat(value) : value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setProductData({
                ...productData,
                image: Array.from(e.target.files),
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productData.seller_id || !productData.store_id) {
            console.error("Seller ID yoki Store ID mavjud emas");
            return;
        }

        const formData = new FormData();
        formData.append("name", productData.name);
        formData.append("description", productData.description);
        formData.append("price", productData.price.toString());
        formData.append("seller_id", productData.seller_id.toString());
        formData.append("store_id", productData.store_id.toString());
        formData.append("category_id", productData.category_id.toString());
        productData.image.forEach((file) => formData.append("image", file));

        try {
            if (editingProductId) {
                await updateProduct({
                    id: editingProductId,
                    body: formData,
                }).unwrap();
                const updatedProduct = products?.find(
                    (p: any) => p.id === editingProductId
                );
                if (updatedProduct) {
                    const jsonData = JSON.stringify(updatedProduct, null, 2);
                    const blob = new Blob([jsonData], {
                        type: "application/json",
                    });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `product_${editingProductId}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }
            } else {
                await addProduct(formData).unwrap();
            }
            refetch();
            setIsAddModalOpen(false);
            setProductData({
                name: "",
                description: "",
                price: 0,
                image: [],
                seller_id: productData.seller_id,
                store_id: productData.store_id,
                category_id: 1,
            });
            setEditingProductId(null);
        } catch (error) {
            console.error("Mahsulot qo‘shish/yangilashda xatolik:", error);
        }
    };

    const handleEdit = (product: any) => {
        setProductData({
            name: product.name,
            description: product.description,
            price: product.price,
            image: [],
            seller_id: product.seller_id,
            store_id: product.store_id,
            category_id: product.category_id,
        });
        setEditingProductId(product.id);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (productId: number) => {
        try {
            await deleteProduct({ id: productId }).unwrap();
            refetch();
        } catch (error) {
            console.error("Mahsulot o‘chirishda xatolik:", error);
        }
    };

    const handleAddImageClick = (productId: number) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.multiple = true;
        fileInput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.files) {
                setNewImages(Array.from(target.files));
                setShowSaveButton(true);
            }
        };
        fileInput.click();
    };

    const handleSaveImages = async (productId: number) => {
        if (newImages.length > 0) {
            const formData = new FormData();
            newImages.forEach((file) => formData.append("images", file));
            try {
                await addProductImage({
                    id: productId,
                    body: formData,
                }).unwrap();
                refetch();
                setNewImages([]);
                setShowSaveButton(false);
            } catch (error) {
                console.error("Rasm qo‘shishda xatolik:", error);
            }
        }
    };

    const handleCancelImages = () => {
        setNewImages([]);
        setShowSaveButton(false);
    };

    const handleDeleteImage = async (productId: number, imageIndex: number) => {
        try {
            await deleteProductImage({
                id: productId,
                index: imageIndex,
            }).unwrap();
            refetch();
            setCurrentImageIndex(0);
        } catch (error) {
            console.error("Rasm o‘chirishda xatolik:", error);
        }
    };

    const filteredProducts =
        products?.filter((product: any) => {
            const matchesSearch =
                product.id.toString().includes(searchTerm) ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                product.price.toString().includes(searchTerm) ||
                product.category?.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter
                ? product.category?.name === categoryFilter
                : true;
            return matchesSearch && matchesCategory;
        }) || [];

    return (
        <div className="flex">
            <main className="flex-1 p-4 ml-64 mt-[72px] relative transition-all duration-300">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    Mahsulotlar
                </h1>
                <p className="text-gray-600 mb-4">
                    Ushbu sahifada sizning barcha mahsulotlaringiz ro‘yxatini
                    ko‘rishingiz va boshqarishingiz mumkin.
                </p>

                <div className="mb-6 flex justify-between items-center gap-4">
                    <input
                        type="text"
                        placeholder="Qidirish (nom, ID, narx, kategoriya)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    <select
                        value={categoryFilter || ""}
                        onChange={(e) =>
                            setCategoryFilter(e.target.value || null)
                        }
                        className="w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="">Barcha kategoriyalar</option>
                        {categories?.map(
                            (category: { name: string; id: number }) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            )
                        )}
                    </select>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                    >
                        Mahsulot qo‘shish
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nomi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tavsif
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Narx
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kategoriya
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Buyurtma Soni
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cart Soni
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rasm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Boshqarish
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product: any) => {
                                const orderCount =
                                    product.orderItems?.length || 0;
                                const cartCount =
                                    product.cartItems?.length || 0;

                                return (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setIsImageModalOpen(true);
                                            setCurrentImageIndex(0);
                                        }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.price} UZS
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.category?.name ||
                                                "Noma’lum"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {orderCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {cartCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={`https://desirable-stillness-production.up.railway.app/product/${
                                                    product.image?.[0] ||
                                                    "default-image.png"
                                                }`}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(product);
                                                    }}
                                                    className="text-teal-600 hover:text-teal-700"
                                                >
                                                    Yangilash
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(
                                                            product.id
                                                        );
                                                    }}
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
            </main>
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            {editingProductId
                                ? "Mahsulotni Yangilash"
                                : "Yangi Mahsulot Qo‘shish"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Nomi
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={productData.name}
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
                                    value={productData.description}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="price"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Narx (UZS)
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={productData.price}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="image"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Rasm(lar)
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    multiple
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                    required={!editingProductId}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="category_id"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Kategoriya
                                </label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={productData.category_id}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    required
                                >
                                    {categories?.map(
                                        (category: {
                                            name: string;
                                            id: number;
                                        }) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setProductData({
                                            name: "",
                                            description: "",
                                            price: 0,
                                            image: [],
                                            seller_id: store?.seller?.id || 3,
                                            store_id: store?.id || 1,
                                            category_id: 1,
                                        });
                                        setEditingProductId(null);
                                    }}
                                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                >
                                    {editingProductId ? "Yangilash" : "Saqlash"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isImageModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl transform transition-transform duration-300 ease-in-out scale-100 opacity-100">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                            {selectedProduct.name}
                        </h2>
                        <div className="carousel w-full h-[500px] relative mb-4">
                            {selectedProduct.image?.map(
                                (img: string, index: number) => (
                                    <img
                                        key={index}
                                        src={`https://desirable-stillness-production.up.railway.app/product/${img}`}
                                        alt={`${selectedProduct.name} rasm ${
                                            index + 1
                                        }`}
                                        className={`absolute w-full h-full object-contain rounded-lg ${
                                            index === currentImageIndex
                                                ? "block"
                                                : "hidden"
                                        }`}
                                    />
                                )
                            )}
                            {selectedProduct.image?.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-between p-4">
                                    <button
                                        onClick={() => {
                                            const newIndex =
                                                (currentImageIndex -
                                                    1 +
                                                    selectedProduct.image
                                                        .length) %
                                                selectedProduct.image.length;
                                            setCurrentImageIndex(newIndex);
                                        }}
                                        className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition-colors duration-300"
                                    >
                                        {" <"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newIndex =
                                                (currentImageIndex + 1) %
                                                selectedProduct.image.length;
                                            setCurrentImageIndex(newIndex);
                                        }}
                                        className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition-colors duration-300"
                                    >
                                        {"> "}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-4">
                            <p className="text-gray-600">
                                Tavsif: {selectedProduct.description}
                            </p>
                            <p className="text-gray-800 font-medium">
                                Narx: {selectedProduct.price} UZS
                            </p>
                            <p className="text-gray-600">
                                Kategoriya:{" "}
                                {selectedProduct.category?.name || "Noma’lum"}
                            </p>
                            <p className="text-gray-600">
                                Buyurtma soni:{" "}
                                {selectedProduct.orderItems?.length || 0}
                            </p>
                            <p className="text-gray-600">
                                Cart'da saqlangan:{" "}
                                {selectedProduct.cartItems?.length || 0}
                            </p>
                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={() =>
                                        handleAddImageClick(selectedProduct.id)
                                    }
                                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-300"
                                >
                                    Rasm qo'shish
                                </button>
                                {showSaveButton && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async () => {
                                                await handleSaveImages(
                                                    selectedProduct.id
                                                );
                                                await refetch();
                                                const updatedProducts =
                                                    await refetch();
                                                const updatedData =
                                                    updatedProducts.data;
                                                const updatedProduct =
                                                    updatedData.find(
                                                        (p: any) =>
                                                            p.id ===
                                                            selectedProduct.id
                                                    );
                                                if (updatedProduct) {
                                                    setSelectedProduct(
                                                        updatedProduct
                                                    );
                                                    setCurrentImageIndex(0);
                                                }
                                            }}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
                                        >
                                            Saqlash
                                        </button>
                                        <button
                                            onClick={handleCancelImages}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300"
                                        >
                                            Bekor qilish
                                        </button>
                                    </div>
                                )}
                                {selectedProduct.image?.map(
                                    (img: string, index: number) => {
                                        const isCurrentImage =
                                            index === currentImageIndex;
                                        return isCurrentImage ? (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2"
                                            >
                                                <img
                                                    src={`https://desirable-stillness-production.up.railway.app/product/${img}`}
                                                    alt={`${
                                                        selectedProduct.name
                                                    } rasm ${index + 1}`}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <button
                                                    onClick={() =>
                                                        handleDeleteImage(
                                                            selectedProduct.id,
                                                            index
                                                        )
                                                    }
                                                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
                                                >
                                                    O‘chirish
                                                </button>
                                            </div>
                                        ) : null;
                                    }
                                )}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={() => setIsImageModalOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none transition-colors duration-300"
                            >
                                Yopish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
