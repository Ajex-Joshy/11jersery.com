import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-4 text-left gap-4"
      >
        <span className="font-semibold text-gray-800">{title}</span>
        {isOpen ? (
          <Minus size={18} className="flex-shrink-0" />
        ) : (
          <Plus size={18} className="flex-shrink-0" />
        )}
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 text-sm text-gray-600 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
