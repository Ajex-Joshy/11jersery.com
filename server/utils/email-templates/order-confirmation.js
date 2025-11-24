const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export const orderConfirmationEmailTemplate = (order) => {
  const orderId = order.orderId || order._id;
  const orderDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      
      <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">
          <span style="text-decoration: none !important; color: #ffffff !important; cursor: default;">11jersey</span>
        </h1>
      </div>

      <div style="padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">Order Confirmed</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Hi there, <br/><br/>
          Thank you for your purchase! We are getting your order ready to be shipped. 
          We will notify you as soon as it is on its way.
        </p>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; display: flex; justify-content: space-between;">
          <div>
            <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase;">Order ID</p>
            <p style="margin: 5px 0 0; font-weight: bold;">#${orderId}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase;">Date</p>
            <p style="margin: 5px 0 0; font-weight: bold;">${orderDate}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #eee;">
              <th style="text-align: left; padding: 10px 0; color: #888;">Item</th>
              <th style="text-align: right; padding: 10px 0; color: #888;">Qty</th>
              <th style="text-align: right; padding: 10px 0; color: #888;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0;">
                  <strong>${item.title}</strong><br/>
                  <span style="font-size: 12px; color: #777;">Size: ${
                    item.size
                  }</span>
                </td>
                <td style="text-align: right; padding: 10px 0;">${
                  item.quantity
                }</td>
                <td style="text-align: right; padding: 10px 0;">${formatCurrency(
                  item.salePrice
                )}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div style="margin-top: 20px; border-top: 2px solid #333; padding-top: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="color: #555;">Subtotal</span>
            <span style="font-weight: 600;">${formatCurrency(
              order.price.subtotal
            )}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="color: #555;">Discount</span>
            <span style="color: #0A8A32; font-weight: 600;">
              - ${formatCurrency(
                order.price.subtotal - order.price.discountedPrice
              )}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="color: #555;">Delivery</span>
            <span style="font-weight: 600;">
              ${
                order.price.deliveryFee === 0
                  ? " Free"
                  : formatCurrency(order.price.deliveryFee)
              }
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 18px; font-weight: bold; margin-top: 12px;">
            <span>Total (COD)</span>
            <span>${formatCurrency(order.price.total)}</span>
          </div>
        </div>

        <div style="margin-top: 30px;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: #888; border-bottom: 1px solid #eee; padding-bottom: 5px;">Shipping Address</h3>
          <p style="color: #555; line-height: 1.4;">
            ${order.shippingAddress.addressLine1}<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${
    order.shippingAddress.pinCode
  }<br/>
            ${order.shippingAddress.country}
          </p>
        </div>
      </div>

      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>Need help? Contact us at support@11jersey.com</p>
        <p>&copy; ${new Date().getFullYear()} 11Jersey. All rights reserved.</p>
      </div>
    </div>
  `;
};
