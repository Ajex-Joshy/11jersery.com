import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react"; // For review arrows

import { useLandingPageData } from "./landingPageHooks.js"; // Adjust path

import ProductCard from "./components/ProductCard.jsx";
import CollectionCard from "./components/CollectionCard.jsx";
import ReviewCard from "./components/ReviewCard.jsx";

// Placeholder components for sections not fully implemented yet
const HeroSection = () => (
  <div className="relative bg-gray-100 py-16 md:py-24 overflow-hidden">
    <div className="flex justify-end items-center px-4 md:px-8">
      <img
        src="/images/home.png"
        alt="Hero"
        className="w-full md:w-[60%] lg:w-[48%] absolute md: mt-130  object-cover"
      />
    </div>
    <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
        Authentic Jerseys
        <br />
        for Football Lovers!
      </h1>
      <p className="text-gray-600 mb-8 max-w-xl mx-auto md:mx-0">
        Top quality fan versions from your favorite clubs and national teams.
        Fast shipping across India.
      </p>
      <div className="flex justify-center md:justify-start gap-8 mb-12 text-center">
        <div>
          <span className="text-3xl font-bold">1000+</span>
          <br />
          <span className="text-sm text-gray-500">Products</span>
        </div>
        <div>
          <span className="text-3xl font-bold">160+</span>
          <br />
          <span className="text-sm text-gray-500">Teams</span>
        </div>
        <div>
          <span className="text-3xl font-bold">700++</span>
          <br />
          <span className="text-sm text-gray-500">5-Star Reviews</span>
        </div>
      </div>
      <Link
        to="/products"
        className="inline-block bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition"
      >
        Shop Now
      </Link>
    </div>
    {/* Placeholder for hero images */}
    <div className="absolute top-0 right-0 h-full w-1/2 hidden md:block">
      {/* Add image elements here positioned absolutely */}
      {/* Example: <img src="/path/to/messi.png" className="absolute bottom-0 right-10 h-3/4" /> */}
    </div>
  </div>
);

const TeamLogos = () => (
  <div className="bg-black py-8">
    <div className="container mx-auto px-4 flex justify-center md:justify-between items-center gap-6 overflow-x-auto">
      {[...Array(8)].map((_, i) => (
        <img
          key={i}
          src={`/images/clubs/${i + 1}.png`}
          alt={`Team Logo ${i + 1}`}
          className="h-8 md:h-17 flex-shrink-0"
        />
      ))}
    </div>
  </div>
);

const ProductSection = ({ title, products }) => (
  <section className="py-12 bg-gray-50">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  </section>
);

const ReviewSection = ({ reviews }) => {
  // Basic scroll container, replace with carousel library (e.g., Swiper, Embla) for better UX
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Love across India!</h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
              <ArrowLeft size={20} />
            </button>
            <button className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {reviews?.reviews?.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const { data: landingData, isLoading, isError, error } = useLandingPageData();

  if (isLoading) {
    return <div className="p-8 text-center">Loading landing page...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading page: {error.message}
      </div>
    );
  }

  // Extract data for sections
  const apiData = landingData?.data || {};
  const productCategories = apiData.categories || [];
  const reviews = apiData.reviews;

  return (
    <div>
      {/* Assuming a separate Header component exists */}
      {/* <Header /> */}

      <HeroSection />
      <TeamLogos />
      {productCategories.map(
        (category) =>
          // Only render if the category has products
          category.products &&
          category.products.length > 0 && (
            <ProductSection
              key={category.title}
              title={category.title}
              products={category.products}
            />
          )
      )}
      {reviews && <ReviewSection reviews={reviews} />}
    </div>
  );
};

export default LandingPage;
