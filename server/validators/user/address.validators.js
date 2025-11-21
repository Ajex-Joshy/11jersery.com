import Joi from "joi";
import { geocodeAddress } from "../../utils/googleGeocode.js";

const addressSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  pinCode: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
  addressLine1: Joi.string().min(5).required(),
  addressLine2: Joi.string().allow("").optional(),
  city: Joi.string().min(2).required(),
  state: Joi.string().min(2).required(),
  country: Joi.string().min(2).default("India"),
  phoneNumber: Joi.string()
    .pattern(/^(?:\+91)?[6-9]\d{9}$/)
    .required(),
  email: Joi.string().email().required(),
  addressName: Joi.string().trim().min(3).max(50).required(),
  isDefault: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
});

const editAddressSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  pinCode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional(),
  addressLine1: Joi.string().min(5).optional(),
  addressLine2: Joi.string().allow("").optional(),
  city: Joi.string().min(2).optional(),
  state: Joi.string().min(2).optional(),
  country: Joi.string().min(2).optional(),
  phoneNumber: Joi.string()
    .pattern(/^(?:\+91)?[6-9]\d{9}$/)
    .optional(),
  email: Joi.string().email().optional(),
  addressName: Joi.string().trim().min(3).max(50).optional(),
  isDefault: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
}).min(1); // Ensure at least one field is updated

export const validateCreateAddress = (req, res, next) => {
  const { error } = addressSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

export const validateEditAddress = (req, res, next) => {
  const { error } = editAddressSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

export const validateAddressWithGoogle = async (req, res, next) => {
  try {
    const {
      addressLine1,
      addressLine2,
      city,
      state,
      pinCode,
      country = "India",
    } = req.body;

    // Build full address string
    const fullAddress = `${addressLine1}, ${
      addressLine2 || ""
    }, ${city}, ${state}, ${pinCode}, ${country}`;

    // Call Google
    const result = await geocodeAddress(fullAddress);
    console.log(fullAddress);
    console.log(result);

    const components = result.address_components;

    // Extract validated Google components
    const googleCity =
      components.find((c) => c.types.includes("locality"))?.long_name || null;

    const googleState =
      components.find((c) => c.types.includes("administrative_area_level_1"))
        ?.long_name || null;

    const googlePincode =
      components.find((c) => c.types.includes("postal_code"))?.long_name ||
      null;

    // Compare Google values with user values
    if (googlePincode && googlePincode !== pinCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode. Google Maps couldn't verify it.",
      });
    }

    if (googleCity && googleCity.toLowerCase() !== city.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "City does not match Google Maps records",
      });
    }

    if (googleState && googleState.toLowerCase() !== state.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "State does not match Google Maps records",
      });
    }

    // Add lat/lng to req for later saving
    req.body.location = {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    };

    // Proceed
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Address validation failed with Google Maps API.",
    });
  }
};
