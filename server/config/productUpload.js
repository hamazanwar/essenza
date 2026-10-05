const multer = require("multer");
const path = require("path");

// ==========================================
// STORAGE
// ==========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/product");

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});


// ==========================================
// FILE TYPE CHECK
// ==========================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPG, PNG and WEBP images are allowed"
            ),
            false
        );

    }

};


// ==========================================
// MULTER
// ==========================================

const uploadProductImage = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


module.exports = uploadProductImage;