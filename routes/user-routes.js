const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const authenticate = require("../middleware/authenticate");
const multer = require("multer");
const upload = multer({ dest: "public-images/" });
const fs = require("fs");

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
  .put(authenticate, upload.single("image"), userController.setupImages);

router
  .route("/:pageLink")
  .get(userController.getProfile)
  .put(authenticate, userController.updateBasic);

router
  .route("/profileimage/:pageLink")
  .put(authenticate, upload.single("image"), userController.updateImages);

router
  .route("/socials/:pageLink")
  .put(authenticate, userController.updateSocials);

router
  .route("/external-links/:pageLink")
  .put(authenticate, userController.updateExternalLinks);

router.route("/image-cards/:pageLink").put(
  authenticate,
  upload.fields([
    {
      name: "image1",
      maxCount: 1,
    },
    {
      name: "image2",
      maxCount: 1,
    },
    {
      name: "image3",
      maxCount: 1,
    },
    {
      name: "image4",
      maxCount: 1,
    },
  ]),
  userController.updateImageCards
);

router
  .route("/gallery/:pageLink")
  .put(authenticate, userController.updateGallery);

router.route("/theme/:pageLink").put(authenticate, userController.updateTheme);

router
  .route("/edit/:pageLink")
  .get(authenticate, userController.getProfileEdit);

router.route("/socials").post(authenticate, userController.setupSocial);
// .put(authenticate, userController.setupImages);

router.route("/links").post(authenticate, userController.setupLinks);
router.route("/imagecards").post(
  authenticate,
  upload.fields([
    {
      name: "image1",
      maxCount: 1,
    },
    {
      name: "image2",
      maxCount: 1,
    },
    {
      name: "image3",
      maxCount: 1,
    },
    {
      name: "image4",
      maxCount: 1,
    },
  ]),
  userController.setupImageCards
);
router.route("/gallery").post(authenticate, userController.setupGalleryImages);
router.route("/theme").post(authenticate, userController.setupTheme);

router.route("/image-upload").post(authenticate, userController.imageUpload);

module.exports = router;
