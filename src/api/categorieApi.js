import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categorieApi = createApi({
    reducerPath: "categorieApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:4000",
        prepareHeaders: (headers, { getState }) => {
            if (typeof window !== "undefined") {
                const href = window.location.href.split("/")[3];

                let token = localStorage.getItem("userToken");
                console.log("categorieApi", href);

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
        addCategorie: builder.mutation({
            query: (credentials) => ({
                url: "/categories",
                method: "POST",
                body: credentials,
            }),
        }),
        getAllCategorie: builder.query({
            query: () => "/categories",
        }),
        updateCategorie: builder.mutation({
            query: (credentials) => ({
                url: "/categories/" + credentials.id,
                method: "PATCH",
                body: credentials.body,
            }),
        }),
        deleteCategorie: builder.mutation({
            query: (credentials) => ({
                url: "/categories/" + credentials.id,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useAddCategorieMutation,
    useGetAllCategorieQuery,
    useUpdateCategorieMutation,
    useDeleteCategorieMutation,
} = categorieApi;
