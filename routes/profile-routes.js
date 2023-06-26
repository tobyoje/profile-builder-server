const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile-controller");

router.route("/").get(profileController.index)
.post(profileController.create);


module.exports = router;
