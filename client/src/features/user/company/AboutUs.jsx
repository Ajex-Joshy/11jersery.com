import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Package, Star, Users } from "lucide-react";

// Reusable component for "Our Promise" section
const PromiseCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <Icon className="w-10 h-10 text-blue-600 mb-3" strokeWidth={1.5} />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{children}</p>
  </div>
);

const AboutUsPage = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          We're More Than Just a Store.
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We are the bridge between you and your passion, delivering the pride
          of your team right to your doorstep.
        </p>
      </div>

      {/* Main Content Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Placeholder */}
          <div className="">
            <img
              src="/images/Ajex_Joshy.jpeg"
              alt="Founder"
              className="w-100 h-100 object-cover rounded-lg"
            />
          </div>

          {/* Mission Text */}
          <div>
            <span className="text-sm font-semibold text-blue-600 uppercase">
              Our Mission
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
              Bring Fans Closer to the Game
            </h2>
            <blockquote className="border-l-4 border-blue-500 pl-4 text-xl italic text-gray-700 my-6">
              "Wear Your Passion. Play Your Heart."
            </blockquote>
            <div className="text-gray-600 space-y-4 text-base">
              <p>
                At 11jersey.com, we believe a football jersey is more than just
                fabric. It’s a symbol of loyalty, a piece of history, and a way
                to carry your team's legacy with you. Our mission is simple: to
                provide every football lover in India with access to premium,
                high-quality fan jerseys for the clubs and players they idolize.
              </p>
              <p>
                We're a team of die-hard fans who were once frustrated by the
                lack of affordable, top-tier jerseys. We set out to change that.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* "Our Promise" Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Promise to You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PromiseCard icon={ShieldCheck} title="Premium Quality">
            We source only the best high-grade polyester fan versions. You get
            breathable fabric and durable prints that last, wash after wash.
          </PromiseCard>
          <PromiseCard icon={Package} title="Unmatched Selection">
            From the latest club kits and national team jerseys to timeless
            retro editions, our collection is curated to satisfy every fan.
          </PromiseCard>
          <PromiseCard icon={Star} title="Top-Tier Service">
            Your passion is our priority. We ensure a seamless shopping
            experience, fast shipping across India, and support that's ready to
            help.
          </PromiseCard>
          <PromiseCard icon={Users} title="For Fans, By Fans">
            We're a community, not just a company. We understand the joy of
            unboxing a new jersey, and we're dedicated to delivering that joy to
            you.
          </PromiseCard>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Wear Your Passion?
          </h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">
            Explore our collections and find the jersey that tells your story.
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-black px-10 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
