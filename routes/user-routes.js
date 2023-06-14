const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

router.route("/").get(userController.index).post(userController.create);

router.route("/:id").get(userController.findUser);
//   .patch(userController.update)
//   .delete(userController.remove);

module.exports = router;
