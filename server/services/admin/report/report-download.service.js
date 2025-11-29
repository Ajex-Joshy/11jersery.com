import { getSalesReport } from "./report.services.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

export const generateReportPDF = async (params, res) => {
  // Fetch ALL data (limit: Infinity is not valid in mongo, use a large number or distinct service call)
  // Let's modify params to get a large limit for download
  const { report, summary } = await getSalesReport({
    ...params,
    limit: 10000,
    page: 1,
  });

  const doc = new PDFDocument({ margin: 30 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=sales_report_${params.period}.pdf`
  );

  doc.pipe(res);

  // --- Header ---
  doc.fontSize(20).text("Sales Report", { align: "center" });
  doc.fontSize(12).text(`Period: ${params.period}`, { align: "center" });
  doc.text(
    `Date Range: ${params.startDate || "All"} to ${params.endDate || "Now"}`,
    { align: "center" }
  );
  doc.moveDown();

  // --- Summary ---
  doc.fontSize(14).text("Summary", { underline: true });
  doc.fontSize(12).text(`Total Sales Count: ${summary.overallSalesCount}`);
  doc.text(`Total Revenue: ₹${summary.overallOrderAmount.toLocaleString()}`);
  doc.text(`Total Discount: ₹${summary.overallDiscount.toLocaleString()}`);
  doc.moveDown();

  // --- Table Headers ---
  const tableTop = 200;
  let y = tableTop;

  doc.font("Helvetica-Bold");
  doc.text("Date", 50, y);
  doc.text("Orders", 200, y);
  doc.text("Revenue", 300, y);
  doc.text("Discount", 450, y);
  y += 20;
  doc.font("Helvetica");
  doc.moveTo(50, y).lineTo(550, y).stroke();
  y += 10;

  // --- Table Rows ---
  report.forEach((row) => {
    if (y > 700) {
      // Add new page if near bottom
      doc.addPage();
      y = 50;
    }

    doc.text(row._id, 50, y);
    doc.text(row.totalOrders.toString(), 200, y);
    doc.text(`₹${row.totalSales.toLocaleString()}`, 300, y);
    doc.text(`₹${row.totalDiscount.toLocaleString()}`, 450, y);
    y += 20;
  });

  doc.end();
};

export const generateReportExcel = async (params, res) => {
  const { report, summary } = await getSalesReport({
    ...params,
    limit: 10000,
    page: 1,
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Report");

  // Summary Rows
  worksheet.addRow(["Sales Report Summary"]);
  worksheet.addRow([`Period: ${params.period}`]);
  worksheet.addRow([`Total Sales: ${summary.overallSalesCount}`]);
  worksheet.addRow([`Total Revenue: ${summary.overallOrderAmount}`]);
  worksheet.addRow([`Total Discount: ${summary.overallDiscount}`]);
  worksheet.addRow([]); // Empty row

  // Table Headers
  worksheet.addRow(["Date", "Orders", "Revenue", "Discount"]);

  // Data Rows
  report.forEach((row) => {
    worksheet.addRow([
      row._id,
      row.totalOrders,
      row.totalSales,
      row.totalDiscount,
    ]);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=sales_report_${params.period}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};
