import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:4000",
        prepareHeaders: (headers, { getState }) => {
            if (typeof window !== "undefined") {
                const href = window.location.href.split("/")[3];

                let token = localStorage.getItem("userToken");
                console.log("userApi", href);

                if (href === "superadmin") {
                    console.log("superadmin");

                    token = localStorage.getItem("superadminToken");
                    headers.set("authorization", `Bearer ${token}`);
                } else if (href === "admin") {
                    token = localStorage.getItem("adminToken");
                    console.log(href);

                    headers.set("authorization", `Bearer ${token}`);
                } else if (href === "seller") {
                    token = localStorage.getItem("sellerToken");
                    headers.set("authorization", `Bearer ${token}`);
                }

                if (token) {
                    headers.set("authorization", `Bearer ${token}`);
                }
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getUser: builder.query({
            query: () => "/users",
        }),
        getOneUser: builder.query({
            query: () => "/users/getme",
        }),
        updateUser: builder.mutation({
            query: (credentials) => ({
                url: "/users",
                method: "PATCH",
                body: credentials,
            }),
        }),
        updateAdmin: builder.mutation({
            query: (credentials) => ({
                url: "/users/" + credentials.id,
                method: "PATCH",
                body: credentials.body,
            }),
        }),
        getAdmins: builder.query({
            query: (credentials) => "/users/role/" + credentials,
        }),
        deleteUser: builder.mutation({
            query: (credentials) => ({
                url: "/users/" + credentials.id,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useGetUserQuery,
    useGetOneUserQuery,
    useUpdateUserMutation,
    useUpdateAdminMutation,
    useGetAdminsQuery,
    useDeleteUserMutation,
} = userApi;
