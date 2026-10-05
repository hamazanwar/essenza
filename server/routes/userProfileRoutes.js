const express = require("express");
const upload = require("../config/upload");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  removeProfileImage,
  addUserAddress,
  getUserAddresses,
  setDefaultAddress,
  updateUserAddress,
  deleteUserAddress
} = require("../controllers/userProfileController");


// PROFILE

router.get(
    "/profile",
    protect,
    getProfile
);


// UPDATE PROFILE

router.patch(
    "/profile",
    protect,
    updateProfile
);


// ADD ADDRESS

router.post(
    "/address",
    protect,
    addUserAddress
);


// GET ADDRESSES

router.get(
    "/addresses",
    protect,
    getUserAddresses
);

// UPDATE ADDRESS

router.patch(
    "/address/:addressId",
    protect,
    updateUserAddress
);

// DELETE ADDRESS

router.delete(
    "/address/:addressId",
    protect,
    deleteUserAddress
);

// SET DEFAULT ADDRESS

router.patch(
    "/address/:addressId/default",
    protect,
    setDefaultAddress
);

router.patch(
  "/profile/image",
  protect,
  upload.single("profileImage"),
  uploadProfileImage
);

router.delete(
  "/profile/image",
  protect,
  removeProfileImage
);


module.exports = router;