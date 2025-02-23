import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bannerApi = createApi({
    reducerPath: "bannerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:4000",
        prepareHeaders: (headers, { getState }) => {
            if (typeof window !== "undefined") {
                const href = window.location.href.split("/")[3];

                let token = localStorage.getItem("userToken");
                console.log("bannerApi", href);

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
        addBanner: builder.mutation({
            query: (credentials) => ({
                url: "/banner",
                method: "POST",
                body: credentials,
            }),
        }),
        getAllBanner: builder.query({
            query: () => "/banner",
        }),
        updateBanner: builder.mutation({
            query: (credentials) => ({
                url: "/banner/" + credentials.id,
                method: "PATCH",
                body: credentials.body,
            }),
        }),
        deleteBanner: builder.mutation({
            query: (credentials) => ({
                url: "/banner/" + credentials.id,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useAddBannerMutation,
    useGetAllBannerQuery,
    useUpdateBannerMutation,
    useDeleteBannerMutation,
} = bannerApi;
