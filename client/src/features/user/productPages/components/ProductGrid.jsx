import React from "react";
import ProductCard from "../../landingPage/components/ProductCard";
import { AlertTriangle } from "lucide-react";

const ProductGrid = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <AlertTriangle size={40} className="mb-4" />
        <h3 className="text-xl font-semibold">No Products Found</h3>
        <p className="text-sm">Try adjusting your filters or search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
