import { useForm } from "react-hook-form";
import { BASE_URL } from "../../utils/constants";
import { useState } from "react";
import js from "@eslint/js";

export default function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      const result = await fetch(`${BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await result.json();
      if (!result.ok) {
        setError(json.error?.message);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800 flex flex-col">
      <header className="absolute top-0 left-0 w-full px-8 py-6">
        <h1 className="text-xl font-bold tracking-tight text-left">
          11jersey.com
        </h1>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-sm px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Admin Login</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 mb-1 text-left"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`w-full px-4 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 transition-shadow`}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 mb-1 text-left"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className={`w-full px-4 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 transition-shadow`}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <p className="text-red-500">{error}</p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800 transition-transform transform hover:scale-105 disabled:bg-green-900 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
