import { formatRupee } from "../../../../utils/currency";
import { Link } from "react-router-dom";

const ChatProductCard = ({ products }) => {
  return (
    <div className="flex gap-4 overflow-x-auto py-2">
      {products.map((product) => {
        return (
          <div
            key={product._id}
            className="min-w-[160px] bg-white border rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="h-28 bg-gray-200 rounded-md mb-3 overflow-hidden flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover aspect-square"
                />
              ) : (
                <span className="text-gray-500 text-xs">No Image</span>
              )}
            </div>

            <h4 className="font-semibold text-[11px] leading-tight line-clamp-2 mb-1">
              {product.title}
            </h4>

            <div className="flex items-center gap-2">
              <p className="text-green-600 font-bold text-sm">
                {formatRupee(product.price?.sale)}
              </p>
              {product.price?.list > product.price?.sale && (
                <p className="text-gray-400 text-[10px] line-through">
                  {formatRupee(product.price?.list)}
                </p>
              )}
            </div>

            <Link
              to={`/product/${product.slug}`}
              className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] py-1.5 rounded-md transition-colors font-semibold text-center block"
            >
              See details
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default ChatProductCard;
