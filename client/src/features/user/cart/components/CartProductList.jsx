import {
  useCart,
  useDecrementItem,
  useIncrementItem,
  useRemoveItemFromCart,
} from "../cartHooks";
import toast from "react-hot-toast";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../../components/common/StateDisplays";
import CartItem from "./CartItem";
import { MAX_QUANTITY_PER_ORDER } from "../../../../utils/constants.js";

/**
 * The list of cart items. Reusable in cart page, checkout, etc.
 */
export const CartProductList = () => {
  const { data: cartPayload, isLoading, isError, error } = useCart();
  const { mutate: incrementMutate } = useIncrementItem();
  const { mutate: decrementMutate } = useDecrementItem();
  const { mutate: removeMutate } = useRemoveItemFromCart();

  const handleIncrement = (item) => {
    if (item.quantity >= MAX_QUANTITY_PER_ORDER) {
      toast.error(
        `Maximum quantity allowed per item is ${MAX_QUANTITY_PER_ORDER}`
      );
      return;
    }

    incrementMutate({ itemId: item._id }); // ✔ only hit API when valid
  };
  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      decrementMutate({ itemId: item._id });
    } else {
      handleRemove(item._id);
    }
  };

  const handleRemove = (itemId) => {
    removeMutate({ itemId });
  };

  const items = cartPayload?.data?.items || [];

  if (isLoading) return <LoadingSpinner text="Loading checkout..." />;
  if (isError) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem
          key={item._id}
          item={item}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton loader for the cart list.
 */
export const CartProductListSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
        <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
        </div>
        <div className="w-24 h-10 bg-gray-200 rounded-md"></div>
      </div>
    ))}
  </div>
);
