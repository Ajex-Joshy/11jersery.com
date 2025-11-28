import {
  getWishlist,
  toggleWishlistItem,
} from "../../services/user/whislist.service.js";
import { asyncHandler } from "../../utils/helpers.js";
import { sendResponse } from "../../utils/helpers.js";

export const getWishlistController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const wishlist = await getWishlist(userId);

  sendResponse(res, {
    statusCode: 200,
    message: "Wishlist fetched successfully",
    payload: wishlist,
  });
});

export const toggleWishlistController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId) {
    throw new Error("Product ID is required");
  }

  const { wishlist, isAdded } = await toggleWishlistItem(userId, productId);

  sendResponse(res, {
    statusCode: 200,
    message: isAdded ? "Added to wishlist" : "Removed from wishlist",
    payload: wishlist,
  });
});
