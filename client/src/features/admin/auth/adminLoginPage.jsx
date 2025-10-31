import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "./adminSlice";
import { useEffect } from "react";

const AdminLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector((store) => store.admin.admin);

  const { status, error: adminError } = useSelector((store) => store.admin);

  const onSubmit = async (data) => {
    console.log(data);
    dispatch(loginAdmin(data));
  };
  useEffect(() => {
    if (admin) navigate("/admin/dashboard");
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="absolute top-6 left-6">
        <h1 className="text-2xl font-bold">11jersey.com</h1>
      </div>

      <div className="w-11/12 sm:w-8/12 md:w-6/12 lg:w-4/12 bg-white p-6 sm:p-8 rounded shadow-md">
        <h1 className="text-xl font-semibold mb-4 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={"ajex.joshy@11jersey.com"}
              className={`border p-2 rounded ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              {...register("identifier", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              defaultValue={"Ajex@12345"}
              className={`border p-2 rounded ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>
          <span className="text-red-500 text-sm text-center">{adminError}</span>
          <button
            type="submit"
            className="bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:bg-gray-500"
            disabled={status === "loading"} // Disable button while loading
          >
            {status === "loading" ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
