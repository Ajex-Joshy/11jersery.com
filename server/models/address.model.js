import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    pinCode: {
      type: String,
      required: [true, "Pin code is required"],
      match: [/^\d{6}$/, "Pin code must be exactly 6 digits"],
    },

    addressLine1: {
      type: String,
      required: [true, "Address Line 1 is required"],
      minlength: [5, "Address Line 1 must be at least 5 characters"],
    },

    addressLine2: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      required: [true, "City is required"],
      minlength: [2, "City must be at least 2 characters"],
    },

    state: {
      type: String,
      required: [true, "State is required"],
      minlength: [2, "State must be at least 2 characters"],
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      default: "India",
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^(?:\+91)?[6-9]\d{9}$/,
        "Phone number must be a valid 10-digit Indian number, optionally starting with +91",
      ],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },

    addressName: {
      type: String,
      required: [true, "Address name is required"],
      minlength: [3, "Address name must be at least 3 characters"],
      maxlength: [50, "Address name cannot exceed 50 characters"],
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;
