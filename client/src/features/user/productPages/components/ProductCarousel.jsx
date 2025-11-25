import React from "react";
import PropTypes from "prop-types";
import ProductCard from "../../landingPage/components/ProductCard";

const ProductCarousel = ({ title, products = [] }) => {
  return (
    <section className="py-12 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          {title}
        </h2>
        {/* For a real carousel, use a library like 'Swiper' or 'Embla' */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

ProductCarousel.propTypes = {
  title: PropTypes.string,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
    })
  ),
};

export default ProductCarousel;
