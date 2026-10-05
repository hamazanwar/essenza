const {
    getAllCustomersService,
    updateCustomerStatusService,
    getCustomerDetailsService
} = require("../services/customerService");


// ==========================================
// GET ALL CUSTOMERS
// ==========================================

const getAllCustomers = async (req, res) => {
    try {

        const result =
            await getAllCustomersService();

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get customers error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};


// ==========================================
// BLOCK / UNBLOCK CUSTOMER
// ==========================================

const updateCustomerStatus = async (
    req,
    res
) => {
    try {

        const result =
            await updateCustomerStatusService(
                req.params.id
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Update customer status error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};

// ==========================================
// GET CUSTOMER DETAILS
// ==========================================

const getCustomerDetails = async (
    req,
    res
) => {
    try {

        const result =
            await getCustomerDetailsService(
                req.params.id
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get customer details error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};


module.exports = {
    getAllCustomers,
    updateCustomerStatus,
    getCustomerDetails
};