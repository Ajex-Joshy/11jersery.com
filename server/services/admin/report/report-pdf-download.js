import { getSalesReport } from "./report.services.js";
import PDFDocument from "pdfkit";

const COMPANY_NAME = "11jersey.com";
const PRIMARY_COLOR = "#2c3e50"; // Dark Slate Blue
const ACCENT_COLOR = "#34495e";
const HEADER_BG_COLOR = "#f3f4f6";
const BORDER_COLOR = "#e5e7eb";

/**
 * Helper: Format currency
 */
const formatCurrency = (amount) =>
  typeof amount === "number"
    ? `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : "-";

/**
 * Helper: Format Date
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString("en-IN");
};

/**
 * Helper: Draw a horizontal line in PDF
 */
const drawLine = (doc, y) => {
  doc
    .strokeColor(BORDER_COLOR)
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
};

/**
 * Generate PDF report
 */
export const generateReportPDF = async (params, res) => {
  try {
    const { report, summary } = await getSalesReport({
      ...params,
      limit: 10000,
      page: 1,
    });

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    const fileName = `sales_report_${params.period}_${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    doc.pipe(res);

    // --- Header Section ---
    doc
      .fontSize(24)
      .fillColor(PRIMARY_COLOR)
      .font("Helvetica-Bold")
      .text(COMPANY_NAME, 50, 50);

    doc
      .fontSize(10)
      .fillColor(ACCENT_COLOR)
      .font("Helvetica")
      .text("Sales Performance Report", 50, 80)
      .text(`Generated on: ${new Date().toLocaleString()}`, 50, 95);

    // Right aligned header details
    doc
      .fontSize(10)
      .text(`Period: ${params.period}`, 400, 50, { align: "right" });
    doc.text(
      `${params.startDate || "Start"} - ${params.endDate || "Present"}`,
      400,
      65,
      { align: "right" }
    );

    drawLine(doc, 115);

    // --- Summary Section ---
    let y = 140;
    doc
      .fontSize(14)
      .fillColor(PRIMARY_COLOR)
      .font("Helvetica-Bold")
      .text("Executive Summary", 50, y);
    y += 25;

    const summaryItems = [
      {
        label: "Total Revenue",
        value: formatCurrency(summary.overallOrderAmount),
      },
      { label: "Total Orders", value: summary.overallSalesCount },
      {
        label: "Total Discount",
        value: formatCurrency(summary.overallDiscount),
      },
      {
        label: "Net Earnings",
        value: formatCurrency(
          summary.overallOrderAmount - summary.overallDiscount
        ),
      }, // Example calculation
    ];

    // Draw Summary Grid
    let xOffset = 50;
    summaryItems.forEach((item) => {
      doc
        .rect(xOffset, y, 115, 50)
        .fillAndStroke(HEADER_BG_COLOR, BORDER_COLOR);
      doc
        .fillColor(ACCENT_COLOR)
        .fontSize(9)
        .font("Helvetica")
        .text(item.label, xOffset + 10, y + 10);
      doc
        .fillColor(PRIMARY_COLOR)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(item.value, xOffset + 10, y + 28);
      xOffset += 125;
    });

    y += 80;

    // --- Table Configuration ---
    const tableTop = y;
    const itemHeight = 25;
    const columns = [
      { label: "Date", property: "_id", width: 100, align: "left" },
      { label: "Orders", property: "totalOrders", width: 80, align: "center" },
      {
        label: "Revenue",
        property: "totalSales",
        width: 100,
        align: "right",
        format: formatCurrency,
      },
      {
        label: "Discount",
        property: "totalDiscount",
        width: 100,
        align: "right",
        format: formatCurrency,
      },
      {
        label: "Net Sales",
        property: "net",
        width: 100,
        align: "right",
        format: (v, r) => formatCurrency(r.totalSales - r.totalDiscount),
      },
    ];

    // --- Table Header ---
    doc.rect(50, y, 500, itemHeight).fill(PRIMARY_COLOR);
    let x = 50;
    doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold");

    columns.forEach((col) => {
      doc.text(col.label, x + 5, y + 8, {
        width: col.width - 10,
        align: col.align,
      });
      x += col.width;
    });

    y += itemHeight;

    // --- Table Body ---
    doc.fillColor("black").font("Helvetica").fontSize(10);

    report.forEach((row, i) => {
      // Page Check
      if (y > 750) {
        doc.addPage();
        y = 50;
        // Redraw Header on new page
        doc.rect(50, y, 500, itemHeight).fill(PRIMARY_COLOR);
        let hx = 50;
        doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold");
        columns.forEach((col) => {
          doc.text(col.label, hx + 5, y + 8, {
            width: col.width - 10,
            align: col.align,
          });
          hx += col.width;
        });
        y += itemHeight;
        doc.fillColor("black").font("Helvetica").fontSize(10);
      }

      // Zebra Striping
      if (i % 2 === 1) {
        doc.rect(50, y, 500, itemHeight).fill(HEADER_BG_COLOR);
        doc.fillColor("black"); // Reset fill after background
      }

      let rx = 50;
      columns.forEach((col) => {
        let textValue = row[col.property];
        if (col.format) textValue = col.format(textValue, row);

        // Special handling for date to make it cleaner
        if (col.property === "_id") textValue = formatDate(textValue);

        doc.text(textValue.toString(), rx + 5, y + 8, {
          width: col.width - 10,
          align: col.align,
        });
        rx += col.width;
      });

      // Row Border
      doc.rect(50, y, 500, itemHeight).strokeColor(BORDER_COLOR).stroke();
      y += itemHeight;
    });

    // --- Footer ---
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor(ACCENT_COLOR)
        .text(
          `© ${new Date().getFullYear()} ${COMPANY_NAME} | Confidential Internal Report`,
          50,
          doc.page.height - 50,
          { align: "center" }
        );
    }

    doc.end();
  } catch (error) {
    console.error("Error generating PDF report:", error);
    res.status(500).send("Failed to generate PDF report.");
  }
};
