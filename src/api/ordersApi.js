import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ordersApi = createApi({
    reducerPath: "ordersApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://desirable-stillness-production.up.railway.app",
        prepareHeaders: (headers, { getState }) => {
            if (typeof window !== "undefined") {
                const href = window.location.href.split("/")[1];

                let token = localStorage.getItem("userToken");
                console.log("ordersApi", href);

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
        addOrder: builder.mutation({
            query: (credentials) => ({
                url: "/orders",
                method: "POST",

                body: credentials,
            }),
        }),
        getOrderAll: builder.query({
            query: () => "/orders",
        }),
        updateOrderStatus: builder.mutation({
            query: (credentials) => ({
                url: "/orders/" + credentials.id,
                method: "PATCH",
                body: credentials.body,
            }),
        }),
    }),
});

export const {
    useAddOrderMutation,
    useGetOrderAllQuery,
    useUpdateOrderStatusMutation,
} = ordersApi;
