import React from "react";

export const LegalPageLayout = ({ title, lastUpdated, children }) => (
  <div className="bg-white py-12 md:py-20">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: {lastUpdated}</p>
      <div className="prose prose-lg max-w-none prose-h2:font-semibold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-p:leading-relaxed prose-p:text-gray-700 prose-ul:text-gray-700 prose-a:text-blue-600 prose-a:hover:underline">
        {children}
      </div>
    </div>
  </div>
);

export const LegalSection = ({ title, children }) => (
  <section className="mb-6">
    <h2>{title}</h2>
    {children}
  </section>
);
