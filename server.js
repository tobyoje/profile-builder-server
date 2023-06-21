require("dotenv").config();
const cors = require("cors");
const express = require("express");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/images", express.static("./files"));

const PORT = process.env.PORT;

const usersRoutes = require("./routes/user-routes");
app.use("/api/user", usersRoutes);

const profileRoutes = require("./routes/profile-routes");
app.use("/profile", profileRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} `);
});
