import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export const EmptyCart = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <ShoppingCart
        size={64}
        className="mx-auto text-gray-300"
        strokeWidth={1}
      />
      <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">
        Your cart is empty
      </h1>
      <p className="text-gray-600 mb-6">
        Looks like you haven't added any jerseys yet.
      </p>
      <Link
        to="/"
        className="inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
};
