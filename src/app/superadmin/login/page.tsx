"use client";
import React from "react";
import { useLoginMutation } from "@/api/authApi";

export default function LoginPage() {
    const [login] = useLoginMutation();

    if (typeof window !== "undefined") {
        if (localStorage.getItem("superadminToken")) {
            window.location.href = "/superadmin";
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const { data } = await login({ email: email, password: password });
        console.log(data);

        if (data?.user?.role === "superadmin") {
            localStorage.setItem("superadminToken", data.token.accsess);
            localStorage.setItem("superadmin", JSON.stringify(data.user));
            window.location.href = "/superadmin";
        } else {
            alert("Bunday foydalanuvchi mavjud emas");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    superadmin Login
                    <p className="text-sm mt-2 opacity-60">
                        placeholder dagi malumotlar super admin chun login parol
                    </p>
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="superAdmin@gmail.com"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-700"
                            placeholder="123456"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
