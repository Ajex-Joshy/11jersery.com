export const S3_URL = "https://11jersey.com-images.s3.eu-north-1.amazonaws.com";
import { Wallet, CreditCard, Banknote } from "lucide-react";

export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const userStatusOptions = [
  { label: "Active", value: "active" },
  { label: "Blocked", value: "blocked" },
];

export const orderStatusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Processing", value: "Processing" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Returned", value: "Returned" },
];

export const ICON_MAP = {
  Wallet,
  CreditCard,
  Banknote,
};

export const paymentMethods = [
  {
    id: "wallet",
    title: "Wallet",
    description: "Pay using your 11jersey.com wallet balance",
    icon: "Wallet",
  },
  {
    id: "online",
    title: "Online Payment",
    description: "UPI, Cards, Netbanking, Wallets & EMI",
    icon: "CreditCard",
  },
  {
    id: "cod",
    title: "Cash on Delivery (COD)",
    description: "Pay with cash upon delivery",
    icon: "Banknote",
  },
];

export const MAX_QUANTITY_PER_ORDER = 20;
export const MAX_COD_AMOUNT = 100000;
