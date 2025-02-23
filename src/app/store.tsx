import { authApi } from "@/api/authApi";
import { storeApi } from "@/api/storeApi";
import { configureStore } from "@reduxjs/toolkit";
import { ordersItemApi } from "@/api/ordersItemApi";
import { productApi } from "@/api/productApi";
import { userApi } from "@/api/userApi";
import { ordersApi } from "@/api/ordersApi";
import { categorieApi } from "@/api/categorieApi";
import { bannerApi } from "@/api/bannerApi";

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [storeApi.reducerPath]: storeApi.reducer,
        [ordersItemApi.reducerPath]: ordersItemApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [ordersApi.reducerPath]: ordersApi.reducer,
        [categorieApi.reducerPath]: categorieApi.reducer,
        [bannerApi.reducerPath]: bannerApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(storeApi.middleware)
            .concat(ordersItemApi.middleware)
            .concat(productApi.middleware)
            .concat(userApi.middleware)
            .concat(ordersApi.middleware)
            .concat(categorieApi.middleware)
            .concat(bannerApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
