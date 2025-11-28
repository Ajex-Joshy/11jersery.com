export const cloneCart = (cart) => ({
  ...cart,
  data: {
    ...cart.data,
    items: cart.data.items.map((i) => ({ ...i })),
  },
});

export const recalcTotals = (cart) => {
  const subtotal = cart.data.items.reduce(
    (sum, item) => sum + item.listPrice * item.quantity,
    0
  );
  const discountedPrice = cart.data.items.reduce(
    (sum, item) => sum + item.salePrice * item.quantity,
    0
  );

  cart.data.subtotal = subtotal;
  cart.data.discount = subtotal - discountedPrice;

  cart.data.deliveryFee = discountedPrice < 500 ? 80 : 0;

  return cart;
};
