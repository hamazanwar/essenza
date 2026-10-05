const {
    testAPIService
} = require("../services/testService");


// ==========================================
// TEST API
// ==========================================

const testAPI = (req, res) => {

    const result =
        testAPIService();

    res.status(200).json(result);
};


module.exports = {
    testAPI
};