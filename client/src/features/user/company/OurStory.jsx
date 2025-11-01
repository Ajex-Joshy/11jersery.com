import React from "react";
import { Link } from "react-router-dom";
import { Flag, Shirt, PackageOpen, Users } from "lucide-react";

const OurStoryPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          It Started with a Single Jersey.
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Like all great stories, ours began with a simple passion: an undying
          love for football.
        </p>
      </div>

      {/* Main Timeline/Story Content */}
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="space-y-16">
          {/* Section 1: The Problem */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 p-4 bg-gray-100 rounded-full">
              <Shirt className="w-12 h-12 text-gray-500" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                The Frustrating Search
              </h2>
              <p className="text-gray-600 leading-relaxed">
                A few years ago, we were just like you. We were a couple of fans
                in India trying to find a high-quality, affordable jersey of our
                favorite player. We searched everywhere, but all we found were
                overpriced options with questionable quality or cheap knock-offs
                that would fade and peel after one wash. We knew there had to be
                a better way for Indian fans to show their support.
              </p>
            </div>
          </div>

          {/* Section 2: The Idea */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-shrink-0 p-4 bg-gray-100 rounded-full">
              <Flag className="w-12 h-12 text-gray-500" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                The "What If?" Moment
              </h2>
              <p className="text-gray-600 leading-relaxed">
                What if we could create a single destination for fans? A place
                built on trust, passion, and a commitment to quality. What if we
                could source the best fan-made jerseys and make them accessible
                to everyone, from Mumbai to Mizoram?
                <br />
                <br />
                The name came easily. A football team has **11** players on the
                pitch. When you wear the **jersey**, you're the 12th man, the
                heart of the team. We wanted to be the place that powers that
                connection. **11jersey.com** was born.
              </p>
            </div>
          </div>

          {/* Section 3: The Journey */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 p-4 bg-gray-100 rounded-full">
              <PackageOpen
                className="w-12 h-12 text-gray-500"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                From a Small Room to a Fan Hub
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We started small, with just a handful of our favorite club
                jerseys stored in a single room. We obsessed over every
                detail—the fabric quality, the stitching, the accuracy of the
                prints. We packed every order ourselves, writing handwritten
                thank-you notes. The word spread. The "Love across India" we saw
                in our first reviews (which we still cherish!) told us we were
                on the right track.
              </p>
              {/*  */}
            </div>
          </div>

          {/* Section 4: Our Future */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-shrink-0 p-4 bg-gray-100 rounded-full">
              <Users className="w-12 h-12 text-gray-500" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                More Than a Store
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Today, 11jersey.com is more than just a store; it's a community.
                Our mission is to continue growing our collection, from iconic
                retro kits to the latest player editions, while never
                compromising on the quality and service that got us here. We're
                still those same fans at heart, and we're honored to share our
                passion with yours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Be a Part of Our Story
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Find the jersey that represents your passion.
          </p>
          <Link
            to="/products"
            className="inline-block bg-black text-white px-10 py-3 rounded-md font-semibold hover:bg-gray-800 transition"
          >
            Shop All Jerseys
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OurStoryPage;
