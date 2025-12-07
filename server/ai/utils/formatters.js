export const normalizeOrderId = (input) => {
  if (!input) return null;

  const numericPart = input.replace(/\D/g, "");

  if (!numericPart) return input;

  const paddedNumber = numericPart.padStart(6, "0");

  // 4. Append prefix
  return `ORD-${paddedNumber}`;
};
