require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const testRoutes = require("./routes/testRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminProfileRoutes = require("./routes/adminProfileRoutes");
const customerRoutes = require("./routes/customerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const categoryPublicRoutes = require("./routes/categoryPublicRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const productPublicRoutes = require("./routes/productPublicRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminCouponRoutes = require("./routes/adminCouponRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.use("/api/test", testRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminProfileRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/categories", categoryPublicRoutes);
app.use("/api/users", userProfileRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/variants", variantRoutes);
app.use("/api/products", productPublicRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/coupons", adminCouponRoutes);



app.get("/", (req, res) => {
  res.send("ESSENZA backend is running");
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
