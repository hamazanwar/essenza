const User = require("../models/user");
const Address = require("../models/Address");


// ==========================================
// GET ALL CUSTOMERS
// ==========================================

const getAllCustomersService = async () => {

    const customers = await User.find({
        role: "user"
    })
        .select("-password")
        .sort({
            createdAt: -1
        });


    return {
        message: "Customers fetched successfully",
        customers
    };
};


// ==========================================
// BLOCK / UNBLOCK CUSTOMER
// ==========================================

const updateCustomerStatusService = async (
    customerId
) => {

    // Find customer
    const customer = await User.findOne({
        _id: customerId,
        role: "user"
    });


    if (!customer) {

        const error = new Error(
            "Customer not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // Toggle status
    customer.isActive =
        !customer.isActive;


    await customer.save();


    return {
        message: customer.isActive
            ? "Customer unblocked successfully"
            : "Customer blocked successfully",

        customer: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
            isActive: customer.isActive
        }
    };
};

// ==========================================
// GET CUSTOMER DETAILS
// ==========================================

const getCustomerDetailsService = async (
    customerId
) => {

    // Find customer
    const customer = await User.findOne({
        _id: customerId,
        role: "user"
    })
        .select("-password");


    if (!customer) {

        const error = new Error(
            "Customer not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // Find all addresses of this customer
    const addresses = await Address.find({
        userId: customer._id
    })
        .sort({
            isDefault: -1,
            createdAt: -1
        });


    return {
        message: "Customer details fetched successfully",

        customer,

        addresses
    };
};


module.exports = {
    getAllCustomersService,
    updateCustomerStatusService,
    getCustomerDetailsService
};