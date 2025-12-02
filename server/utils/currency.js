export const toPaise = (rupee) => Math.round(rupee * 100);
export const toRupee = (paise) => (paise / 100).toFixed(2);
export const formatCurrency = (amountInPaisa) =>
  typeof amountInPaisa === "number"
    ? `₹${(amountInPaisa / 100).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`
    : "-";
