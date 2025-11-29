import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import { getSalesReport } from "../../services/admin/report/report.services.js";
import {
  generateReportPDF,
  generateReportExcel,
} from "../../services/admin/report/report-download.service.js";

export const getSalesReportController = asyncHandler(async (req, res) => {
  const result = await getSalesReport(req.query);
  sendResponse(res, {
    statusCode: 200,
    message: "Sales report fetched successfully",
    payload: result,
  });
});

export const downloadReportController = asyncHandler(async (req, res) => {
  const { format } = req.query; // 'pdf' or 'excel'

  if (format === "pdf") {
    await generateReportPDF(req.query, res);
  } else if (format === "excel") {
    await generateReportExcel(req.query, res);
  } else {
    res.status(400).json({ message: "Invalid format. Use 'pdf' or 'excel'." });
  }
});
