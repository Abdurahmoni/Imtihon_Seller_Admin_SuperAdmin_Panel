import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
    reducerPath: "productApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:4000",
        prepareHeaders: (headers, { getState }) => {
            if (typeof window !== "undefined") {
                const href = window.location.href.split("/")[3];

                let token = localStorage.getItem("userToken");
                console.log("productApi", href);

                if (href === "superadmin") {
                    token = localStorage.getItem("superadminToken");
                } else if (href === "admin") {
                    token = localStorage.getItem("adminToken");
                    headers.set("authorization", `Bearer ${token}`);
                } else if (href === "seller") {
                    token = localStorage.getItem("sellerToken");
                }

                if (token) {
                    headers.set("authorization", `Bearer ${token}`);
                }
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        addProduct: builder.mutation({
            query: (credentials) => ({
                url: "/products",
                method: "POST",

                body: credentials,
            }),
        }),
        getProductsSeller: builder.query({
            query: () => "/products/sellerProducts",
        }),
        updateProduct: builder.mutation({
            query: (credentials) => ({
                url: "/products/" + credentials.id,
                method: "PATCH",
                body: credentials,
            }),
        }),
        deleteProduct: builder.mutation({
            query: (credentials) => ({
                url: "/products/" + credentials.id,
                method: "DELETE",
            }),
        }),
        addProdactImage: builder.mutation({
            query: (credentials) => ({
                url: "/products/add-images/" + credentials.id,
                method: "POST",
                body: credentials.body,
            }),
        }),
        deleteProductImage: builder.mutation({
            query: (credentials) => ({
                url:
                    "/products/image/" +
                    credentials.id +
                    "/" +
                    credentials.index,
                method: "DELETE",
            }),
        }),
        getAllproducts: builder.query({
            query: () => "/products",
        }),
    }),
});

export const {
    useAddProductMutation,
    useGetProductsSellerQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useAddProdactImageMutation,
    useDeleteProductImageMutation,
    useGetAllproductsQuery,
} = productApi;
