import fs from "fs";
import path from "path";
import orderModel from "../../../models/order.model.js";

export const generateInvoice = async (userId, orderId, res) => {
  try {
    const order = await orderModel
      .findOne({ _id: orderId, userId })
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Set headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderId}.pdf`
    );

    doc.pipe(res);

    // --- Colors & Fonts ---
    const primaryColor = "#000000"; // Black
    const secondaryColor = "#444444"; // Dark Gray
    const lineColor = "#cccccc"; // Light Gray

    // --- Header Section ---
    // Company Logo (Optional - replace with path if you have one)
    // doc.image('path/to/logo.png', 50, 45, { width: 50 });

    // Company Info (Top Right)
    doc
      .fillColor(primaryColor)
      .fontSize(20)
      .text("11JERSEY.COM", { align: "right" })
      .fontSize(10)
      .text("Thiruvanchira Road, ollur", { align: "right" })
      .text("Thrissur, Kerala, India", { align: "right" })
      .text("support@11jersey.com", { align: "right" })
      .moveDown();

    // Invoice Title (Top Left)
    doc
      .fontSize(25)
      .text("INVOICE", 50, 60, { align: "left" }) // Absolute positioning for title
      .fontSize(10)
      .text(
        `Invoice Number: INV-${order._id.toString().slice(-6).toUpperCase()}`,
        50,
        95
      )
      .text(
        `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
        50,
        110
      )
      .text(`Order ID: ${order.orderId}`, 50, 125)
      .text(`Payment Method: ${order.payment.method}`, 50, 140)
      .text(`Payment Status: ${order.payment.status}`, 50, 155);

    doc.moveDown(2);

    // --- Divider Line ---
    doc
      .strokeColor(lineColor)
      .lineWidth(1)
      .moveTo(50, 175)
      .lineTo(550, 175)
      .stroke();
    doc.moveDown(2);

    // --- Billing & Shipping Info ---
    const customerY = 190;

    doc.fontSize(12).fillColor(primaryColor).text("Bill To:", 50, customerY);
    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .text(
        `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        50,
        customerY + 15
      )
      .text(order.shippingAddress.addressLine1, 50, customerY + 30)
      .text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}`,
        50,
        customerY + 45
      )
      .text(order.shippingAddress.country, 50, customerY + 60)
      .text(`Phone: ${order.shippingAddress.phone}`, 50, customerY + 75)
      .text(`Email: ${order.shippingAddress.email}`, 50, customerY + 90);

    doc.moveDown(4);

    // --- Table Header ---
    const tableTop = 330;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const priceX = 430;
    const totalX = 500;

    doc
      .fontSize(10)
      .fillColor(primaryColor)
      .text("Item", itemCodeX, tableTop, { bold: true })
      .text("Description", descriptionX, tableTop)
      .text("Qty", quantityX, tableTop)
      .text("Price", priceX, tableTop)
      .text("Total", totalX, tableTop);

    doc
      .strokeColor(lineColor)
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // --- Table Rows ---
    let y = tableTop + 30;
    let totalItemsPrice = 0;

    order.items.forEach((item) => {
      const itemTotal = item.salePrice * item.quantity;
      totalItemsPrice += itemTotal;

      // Handle long titles (basic wrapping)
      const title =
        item.title.length > 40
          ? item.title.substring(0, 37) + "..."
          : item.title;
      const desc = `Size: ${item.size}`;

      doc
        .fontSize(10)
        .fillColor(secondaryColor)
        .text((order.items.indexOf(item) + 1).toString(), itemCodeX, y)
        .text(title, descriptionX, y)
        .fontSize(8)
        .text(desc, descriptionX, y + 12) // Size below title
        .fontSize(10)
        .text(item.quantity.toString(), quantityX, y)
        .text(`Rs. ${item.listPrice}`, priceX, y)
        .text(`Rs. ${item.salePrice * item.quantity}`, totalX, y);

      y += 40; // Row height

      // Add a light line between rows
      doc
        .strokeColor("#eeeeee")
        .lineWidth(0.5)
        .moveTo(50, y - 10)
        .lineTo(550, y - 10)
        .stroke();
    });

    // --- Summary Section ---
    const summaryTop = y + 40;
    const summaryLabelX = 350;
    const summaryValueX = 500;

    doc
      .strokeColor(lineColor)
      .lineWidth(1)
      .moveTo(350, summaryTop)
      .lineTo(550, summaryTop)
      .stroke();

    doc
      .fontSize(10)
      .fillColor(primaryColor)
      .text("Subtotal:", summaryLabelX, summaryTop + 10)
      .text(
        `Rs. ${order.price.subtotal.toLocaleString()}`,
        summaryValueX,
        summaryTop + 10
      );

    const discountValue = order.price.subtotal - order.price.discountedPrice;
    if (discountValue > 0) {
      doc
        .text("Discount:", summaryLabelX, summaryTop + 25)
        .text(
          `- Rs. ${discountValue.toLocaleString()}`,
          summaryValueX,
          summaryTop + 25
        );
    }

    doc
      .text("Delivery Fee:", summaryLabelX, summaryTop + 40)
      .text(
        order.price.deliveryFee === 0
          ? "Free"
          : `Rs. ${order.price.deliveryFee.toLocaleString()}`,
        summaryValueX,
        summaryTop + 40
      );

    doc
      .strokeColor(lineColor)
      .lineWidth(1)
      .moveTo(350, summaryTop + 60)
      .lineTo(550, summaryTop + 60)
      .stroke();

    doc
      .fontSize(12)
      .fillColor(primaryColor)
      .font("Helvetica-Bold") // Use standard bold font
      .text("Total:", summaryLabelX, summaryTop + 70)
      .text(
        `Rs. ${order.price.total.toLocaleString()}`,
        summaryValueX,
        summaryTop + 70
      );

    // --- Footer ---
    const bottomY = 750;
    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .font("Helvetica")
      .text("Thank you for shopping with 11Jersey.com!", 50, bottomY, {
        align: "center",
        width: 500,
      });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating invoice" });
  }
};
