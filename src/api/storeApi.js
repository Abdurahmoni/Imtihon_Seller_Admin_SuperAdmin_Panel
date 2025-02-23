import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const storeApi = createApi({
    reducerPath: "storeApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://desirable-stillness-production.up.railway.app",
        prepareHeaders: (headers, { getState }) => {
            if (typeof window !== "undefined") {
                const href = window.location.href.split("/")[1];

                let token = localStorage.getItem("userToken");
                console.log("storeApi", href);

                if (href === "superadmin") {
                    token = localStorage.getItem("superadminToken");
                } else if (href === "admin") {
                    console.log(href);

                    token = localStorage.getItem("adminToken");
                    console.log(token);

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
        addStore: builder.mutation({
            query: (credentials) => ({
                url: "/stores",
                method: "POST",
                body: credentials,
            }),
        }),
        getStorMe: builder.query({
            query: () => "/stores/me",
        }),
        updateStore: builder.mutation({
            query: (credentials) => ({
                url: "/stores/" + credentials.id,
                method: "PATCH",
                body: credentials,
            }),
        }),
        deleteStore: builder.mutation({
            query: (credentials) => ({
                url: "/stores/" + credentials.id,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useAddStoreMutation,
    useGetStorMeQuery,
    useUpdateStoreMutation,
    useDeleteStoreMutation,
} = storeApi;
