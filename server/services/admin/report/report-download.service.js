import { getSalesReport } from "./report.services.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

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
    throw error;
  }
};

/**
 * Generate Excel report
 */
export const generateReportExcel = async (params, res) => {
  try {
    const { report, summary } = await getSalesReport({
      ...params,
      limit: 10000,
      page: 1,
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = COMPANY_NAME;
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Sales Data", {
      views: [{ showGridLines: false }],
    });

    // --- Styling Constants ---
    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" }, size: 12 },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2C3E50" },
      }, // Dark Blue
      alignment: { vertical: "middle", horizontal: "center" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const titleStyle = {
      font: { bold: true, size: 16, color: { argb: "FF2C3E50" } },
      alignment: { horizontal: "left" },
    };

    // --- Title & Metadata ---
    worksheet.mergeCells("A1:E1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${COMPANY_NAME} - Sales Report`;
    titleCell.style = titleStyle;

    worksheet.mergeCells("A2:E2");
    worksheet.getCell("A2").value = `Period: ${params.period} | Date Range: ${
      params.startDate || "All"
    } to ${params.endDate || "Now"}`;
    worksheet.getCell("A2").font = {
      italic: true,
      color: { argb: "FF555555" },
    };

    worksheet.addRow([]); // Spacer

    // --- Summary Section in Excel ---
    const summaryHeader = worksheet.addRow(["Metric", "Value"]);
    summaryHeader.font = { bold: true };

    const summaryData = [
      ["Total Orders", summary.overallSalesCount],
      ["Total Revenue", summary.overallOrderAmount],
      ["Total Discount", summary.overallDiscount],
      ["Special Discount", summary.overallSpecialDiscount],
      ["Coupon Discount", summary.overallCouponDiscount],
    ];

    summaryData.forEach((row) => {
      const r = worksheet.addRow(row);
      // Format currency for specific summary rows
      if (
        typeof row[1] === "number" &&
        row[0].includes("Total") &&
        !row[0].includes("Orders")
      ) {
        r.getCell(2).numFmt = '"₹"#,##0.00';
      }
    });

    worksheet.addRow([]); // Spacer

    // --- Data Table Headers ---
    const headers = ["Date", "Orders", "Revenue", "Discount", "Net Sales"];
    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // --- Data Table Rows ---
    report.forEach((row) => {
      const netSales = (row.totalSales || 0) - (row.totalDiscount || 0);
      const dataRow = worksheet.addRow([
        formatDate(row._id),
        row.totalOrders,
        row.totalSales,
        row.totalDiscount,
        netSales,
      ]);

      // Alignments & Borders
      dataRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
        if (colNumber === 1) cell.alignment = { horizontal: "left" }; // Date
        if (colNumber > 1) cell.alignment = { horizontal: "right" }; // Numbers
      });

      // Currency Formatting (Column 3, 4, 5)
      dataRow.getCell(3).numFmt = '"₹"#,##0.00';
      dataRow.getCell(4).numFmt = '"₹"#,##0.00';
      dataRow.getCell(5).numFmt = '"₹"#,##0.00';
    });

    // --- Auto Width Columns ---
    worksheet.columns = [
      { width: 20 }, // Date
      { width: 15 }, // Orders
      { width: 20 }, // Revenue
      { width: 20 }, // Discount
      { width: 20 }, // Net
    ];

    const fileName = `sales_report_${params.period}_${Date.now()}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    throw error;
  }
};
