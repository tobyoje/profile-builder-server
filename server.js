require("dotenv").config();
const cors = require("cors");
const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "public-images/" });
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/images", express.static("./files"));
app.use("/public-images", express.static("public-images"));

const PORT = process.env.PORT;

const usersRoutes = require("./routes/user-routes");
app.use("/api/user", usersRoutes);


app.get("/public-images/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const readStream = fs.createReadStream(`public-images/${imageName}`);
  readStream.pipe(res);
});


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} `);
});
