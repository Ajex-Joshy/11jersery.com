import { getSalesReport } from "./report.services.js";
import ExcelJS from "exceljs";
import { formatCurrency } from "../../../utils/currency.js";

const COMPANY_NAME = "11jersey.com";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString("en-IN");
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
      ["Total Revenue", formatCurrency(summary.overallOrderAmount)],
      ["Total Discount", formatCurrency(summary.overallDiscount)],
      ["Special Discount", formatCurrency(summary.overallSpecialDiscount)],
      ["Coupon Discount", formatCurrency(summary.overallCouponDiscount)],
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
        formatCurrency(row.totalSales),
        formatCurrency(row.totalDiscount),
        formatCurrency(netSales),
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
