require("dotenv").config();
const cors = require("cors");
const express = require("express");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

const usersRoutes = require("./routes/user-routes");
app.use("/user", usersRoutes);



app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} `);
});
