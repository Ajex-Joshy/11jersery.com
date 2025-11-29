import logger from "../../../../../config/logger.js";
import { sendEmail } from "../../../../../utils/email-service.js";
import { orderConfirmationEmailTemplate } from "../../../../../utils/email-templates/order-confirmation.js";

export const sendOrderConfirmationEmail = async (order) => {
  const orderId = order.orderId || order._id;
  const email = order.shippingAddress.email;

  try {
    await sendEmail({
      to: email,
      subject: `Order Confirmation #${orderId} – 11Jersey`,
      html: orderConfirmationEmailTemplate(order),
    });
    logger.info(`Email sent successfully to ${email}`);
  } catch (error) {
    logger.error("Failed to send confirmation email:", error);
  }
};
