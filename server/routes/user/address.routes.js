import express from "express";
const router = express.Router();

import {
  addAddressController,
  getAllAddressController,
  editAddressController,
  deleteAddressController,
  getAddressByIdController,
} from "../../controllers/user/address.controller.js";

import {
  validateAddressWithGoogle,
  validateCreateAddress,
  validateEditAddress,
} from "../../validators/user/address.validators.js";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";

router.use(authenticateUser);

router.post(
  "/",
  validateCreateAddress,
  validateAddressWithGoogle,
  addAddressController
);

router.get("/", getAllAddressController);

router.get("/:id", getAddressByIdController);

router.patch(
  "/:id",
  validateEditAddress,
  // validateAddressWithGoogle,
  editAddressController
);

router.delete("/:id", deleteAddressController);

export default router;
