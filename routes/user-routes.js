const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const authenticate = require("../middleware/authenticate");

router.route("/").get(userController.index);

// router.route("/:id").get(userController.findUser);
//   .patch(userController.update)
//   .delete(userController.remove);

router.route("/register").post(userController.create);
router.route("/login").post(userController.login);
router.route("/current").get(authenticate, userController.findUser);
router
  .route("/setup")
  .post(authenticate, userController.setupBasic)
  .get(userController.getBasicData)
  .put(authenticate, userController.setupImages);

router
  .route("/:pageLink")
  .get(userController.getProfile)
  .put(authenticate, userController.updateBasic);

router
  .route("/edit/:pageLink")
  .get(authenticate, userController.getProfileEdit);

router.route("/socials").post(authenticate, userController.setupSocial);
// .put(authenticate, userController.setupImages);

router.route("/links").post(authenticate, userController.setupLinks);
router.route("/imagecards").post(authenticate, userController.setupImageCards);
router.route("/gallery").post(authenticate, userController.setupGalleryImages);
router.route("/theme").post(authenticate, userController.setupTheme);

router.route("/image-upload").post(authenticate, userController.imageUpload);

module.exports = router;
