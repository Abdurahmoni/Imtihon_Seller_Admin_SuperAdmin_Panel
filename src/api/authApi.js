import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://desirable-stillness-production.up.railway.app",
        prepareHeaders: (headers, { getState }) => {
            if (typeof window !== "undefined") {
                const href = window.location.href.split("/")[1];

                let token = localStorage.getItem("userToken");

                if (href === "superadmin") {
                    token = localStorage.getItem("superadminToken");
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
        signup: builder.mutation({
            query: (credentials) => ({
                url: "/users/register",
                method: "POST",
                body: credentials,
            }),
        }),
        login: builder.mutation({
            query: (credentials) => ({
                url: "/users/login",
                method: "POST",
                body: credentials,
            }),
        }),
    }),
});

export const { useSignupMutation, useLoginMutation } = authApi;
