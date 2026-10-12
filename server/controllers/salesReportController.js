
const {
  getSalesReportService,
} = require("../services/salesReportService");

const getSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const report = await getSalesReportService(from, to);

    return res.status(200).json({
      success: true,
      message: "Sales report fetched successfully.",
      report,
    });
  } catch (error) {
    console.error("Get sales report error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch sales report.",
    });
  }
};

module.exports = {
  getSalesReport,
};
