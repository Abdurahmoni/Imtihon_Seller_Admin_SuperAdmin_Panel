"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useSignupMutation } from "@/api/authApi";

export default function RegisterPage() {
    const [signup] = useSignupMutation();

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (localStorage.getItem("sellerToken")) {
                window.location.href = "/seller";
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const first_name = formData.get("first_name");
        const last_name = formData.get("last_name");
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const phone = formData.get("phone") as string;
        const role = "seller";

        const { data } = await signup({
            first_name,
            last_name,
            email,
            password,
            phone,
            role,
        });

        if (data.user.role === "seller") {
            localStorage.setItem("sellerToken", data.token.accsess);
            localStorage.setItem("refreshToken", data.token.refresh);
            localStorage.setItem("seller", JSON.stringify(data.user));
            window.location.href = "/seller";
        } else {
            alert("Qayta ro'yxatdan o'ting");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Seller Register
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="first_name"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="First Name"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="last_name"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Last Name"
                            required
                        />
                    </div>

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
                            placeholder="Enter your email"
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Phone
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="phone"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Phone"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        href="/seller/login"
                        className="text-teal-600 hover:text-teal-500"
                    >
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
