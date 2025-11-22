import {
  addAddress,
  getAllAddresses,
  getAddressById,
  editAddress,
  deleteAddress,
} from "../../services/user/address.services.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { sendResponse } from "../../utils/helpers.js";
import { validateObjectId } from "../../utils/product.utils.js";
import { asyncHandler } from "../../utils/helpers.js";

/**
 * Add New Address Controller
 */
export const addAddressController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressData = req.body;

  const created = await addAddress(userId, addressData);

  return sendResponse(
    res,
    { message: "Address added successfully", data: created },
    STATUS_CODES.CREATED
  );
});

/**
 * Get All Addresses Controller
 */
export const getAllAddressController = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let addresses = await getAllAddresses(userId);

  return sendResponse(res, { data: addresses });
});

/**
 * Edit Address Controller
 */
export const editAddressController = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  validateObjectId(addressId);

  const updated = await editAddress(addressId, req.body);

  if (!updated) {
    return sendResponse(
      res,
      { message: "Address not found" },
      STATUS_CODES.NOT_FOUND
    );
  }

  return sendResponse(res, {
    message: "Address updated successfully",
    data: updated,
  });
});

/**
 * Delete Address Controller
 */
export const deleteAddressController = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  validateObjectId(addressId);

  const deleted = await deleteAddress(addressId);

  if (!deleted) {
    return sendResponse(
      res,
      { message: "Address not found" },
      STATUS_CODES.NOT_FOUND
    );
  }

  return sendResponse(res, { message: "Address deleted successfully" });
});

export const getAddressByIdController = asyncHandler(async (req, res) => {
  const addressId = req.params.id;
  validateObjectId(addressId);

  const address = await getAddressById(addressId);

  if (!address) {
    return sendResponse(
      res,
      { message: "Address not found" },
      STATUS_CODES.NOT_FOUND
    );
  }

  sendResponse(res, { address });
});
