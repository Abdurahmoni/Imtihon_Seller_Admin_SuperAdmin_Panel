"use client";

import { store } from "@/app/store";
import { Provider } from "react-redux";

export default function ({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
}
