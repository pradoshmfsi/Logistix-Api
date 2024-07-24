const express = require("express");
const { dbConn } = require("./config/db");
require("dotenv").config();
const userRoutes = require("./routes/user");
const shipmentRoutes = require("./routes/shipment");

const cors = require("cors");
const app = express();
const port = process.env.PORT || 4001;
app.use(express.json());
app.use(cors());

// app.use(productRoutes);
app.use("/user", userRoutes);
app.use("/", shipmentRoutes);

dbConn();
app.listen(port, "0.0.0.0", () => {
  console.log(`Server started at port ${port}`);
});
