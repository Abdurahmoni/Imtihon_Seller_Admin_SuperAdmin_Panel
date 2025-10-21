import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ordersItemApi = createApi({
    reducerPath: "ordersItemApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:4000",
        prepareHeaders: (headers, { getState }) => {
            if (typeof window !== "undefined") {
                const href = window.location.href.split("/")[3];

                let token = localStorage.getItem("userToken");
                console.log("ordersItemApi", href);

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
        addOrder_item: builder.mutation({
            query: (credentials) => ({
                url: "/order-items",
                method: "POST",

                body: credentials,
            }),
        }),
        getOrderItemsAll: builder.query({
            query: () => "/order-items",
        }),
        getOrderStore: builder.query({
            query: (storeId) => "/order-items/store/" + storeId,
        }),
        getOrderId: builder.query({
            query: (orderId) => "/order-items/order/" + orderId,
        }),
        updateOrder_ItemStatus: builder.mutation({
            query: (credentials) => ({
                url: "/order-items/" + credentials.id + "/status",
                method: "PATCH",
                body: { status: credentials.status },
            }),
        }),
    }),
});

export const {
    useAddOrder_itemMutation,
    useGetOrderItemsAllQuery,
    useGetOrderStoreQuery,
    useGetOrderIdQuery,
    useUpdateOrder_ItemStatusMutation,
} = ordersItemApi;
