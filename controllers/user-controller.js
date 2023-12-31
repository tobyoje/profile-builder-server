const knex = require("knex")(require("../knexfile"));
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ dest: "public-images/" });
const fs = require("fs");

const index = (req, res) => {
  knex("user")
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => res.status(400).send(`Error retrieving users: ${err}`));
};

const create = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send("Please provide required information in the request");
  }

  const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!email.match(mailformat)) {
    return res.status(400).send("Please provide a valid email");
  }

  const hashedPassword = bcrypt.hashSync(password);

  const newUser = {
    email,
    password: hashedPassword,
  };

  try {
    await knex("user").insert(newUser);
    res.status(201).send("Registered successfully");
  } catch (error) {
    console.log(error);
    res.status(400).send("Unable to create new user");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please enter the required fields");
  }

  const userAndProfile = await knex("user")
    .where({ email })
    .join("profile", "profile.user_id", "user.id")
    .first();

  const user = await knex("user").where({ email }).first();

  if (!user) {
    return res.status(400).send("Invalid email");
  }

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).send("Invalid password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_KEY,
    { expiresIn: "24h" }
  );

  console.log(token);
  console.log(userAndProfile);
  if (userAndProfile && userAndProfile.page_link) {
    res.json({
      token,
      user_id: user.id,
      page_link: userAndProfile.page_link,
    });
  } else {
    res.json({
      token,
      user_id: user.id,
      page_link: null,
    });
  }
};

const findUser = async (req, res) => {
  console.log(req.body);
  const user = await knex("user").where({ id: req.user.id }).first();
  res.json(user);
};

const getProfile = (req, res) => {
  knex("profile")
    .join("theme", "theme.profile_id", "profile.id")
    .join("links", "links.profile_id", "profile.id")
    .join("imagecards", "imagecards.profile_id", "profile.id")
    .join("socials", "socials.profile_id", "profile.id")
    .join("gallery", "gallery.profile_id", "profile.id")
    .where({ page_link: req.params.pageLink })
    .then((result) => {
      if (result.length === 0) {
        res
          .status(404)
          .json({ message: "Unable to find profile with this link." });
      } else {
        const profile = { ...result[0] };
        const userID = profile.user_id;
        knex("user")
          .where({ id: userID })
          .then((userResult) => {
            const dataToSend = {
              id: profile.id,
              full_name: profile.full_name,
              page_title: profile.page_title,
              page_link: profile.page_link,
              biography: profile.biography,
              profile_image: profile.profile_image,
              hero_image: profile.hero_image,
              user_id: profile.user_id,
              style: result[0].style,
              color: result[0].color,
              font: result[0].font,
              ext_link1: result[0].ext_link1,
              ext_title1: result[0].ext_title1,
              ext_link2: result[0].ext_link2,
              ext_title2: result[0].ext_title2,
              ext_link3: result[0].ext_link3,
              ext_title3: result[0].ext_title3,
              ext_link4: result[0].ext_link4,
              ext_title4: result[0].ext_title4,
              ic_link1: result[0].ic_link1,
              ic_title1: result[0].ic_title1,
              ic_image1: result[0].ic_image1,
              ic_link2: result[0].ic_link2,
              ic_title2: result[0].ic_title2,
              ic_image2: result[0].ic_image2,
              ic_link3: result[0].ic_link3,
              ic_title3: result[0].ic_title3,
              ic_image3: result[0].ic_image3,
              ic_link4: result[0].ic_link4,
              ic_title4: result[0].ic_title4,
              ic_image4: result[0].ic_image4,
              ic_link5: result[0].ic_link5,
              ic_title5: result[0].ic_title5,
              ic_image5: result[0].ic_image5,
              ic_link6: result[0].ic_link6,
              ic_title6: result[0].ic_title6,
              ic_image6: result[0].ic_image6,
              twitter: result[0].twitter,
              facebook: result[0].facebook,
              linkedin: result[0].linkedin,
              instagram: result[0].instagram,
              youtube: result[0].youtube,
              github: result[0].github,
              email: result[0].email,
              g_image1: result[0].g_image1,
              g_image2: result[0].g_image2,
              g_image3: result[0].g_image3,
              g_image4: result[0].g_image4,
              g_image5: result[0].g_image5,
              g_image6: result[0].g_image6,
              g_image7: result[0].g_image7,
              g_image8: result[0].g_image8,
            };
            res.status(200).send(dataToSend);
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal server error." });
    });
};

const getProfileEdit = (req, res) => {
  knex("profile")
    .join("theme", "theme.profile_id", "profile.id")
    .join("links", "links.profile_id", "profile.id")
    .join("imagecards", "imagecards.profile_id", "profile.id")
    .join("socials", "socials.profile_id", "profile.id")
    .join("gallery", "gallery.profile_id", "profile.id")
    .where({ page_link: req.params.pageLink })
    .then((result) => {
      if (result.length === 0) {
        res
          .status(404)
          .json({ message: "Unable to find profile with this link." });
      } else {
        const profile = { ...result[0] };
        const userID = profile.user_id;
        knex("user")
          .where({ id: userID })
          .then((userResult) => {
            const dataToSend = {
              id: profile.id,
              full_name: profile.full_name,
              page_title: profile.page_title,
              page_link: profile.page_link,
              biography: profile.biography,
              profile_image: profile.profile_image,
              hero_image: profile.hero_image,
              user_id: profile.user_id,
              style: result[0].style,
              color: result[0].color,
              font: result[0].font,
              ext_link1: result[0].ext_link1,
              ext_title1: result[0].ext_title1,
              ext_link2: result[0].ext_link2,
              ext_title2: result[0].ext_title2,
              ext_link3: result[0].ext_link3,
              ext_title3: result[0].ext_title3,
              ext_link4: result[0].ext_link4,
              ext_title4: result[0].ext_title4,
              ic_link1: result[0].ic_link1,
              ic_title1: result[0].ic_title1,
              ic_image1: result[0].ic_image1,
              ic_link2: result[0].ic_link2,
              ic_title2: result[0].ic_title2,
              ic_image2: result[0].ic_image2,
              ic_link3: result[0].ic_link3,
              ic_title3: result[0].ic_title3,
              ic_image3: result[0].ic_image3,
              ic_link4: result[0].ic_link4,
              ic_title4: result[0].ic_title4,
              ic_image4: result[0].ic_image4,
              ic_link5: result[0].ic_link5,
              ic_title5: result[0].ic_title5,
              ic_image5: result[0].ic_image5,
              ic_link6: result[0].ic_link6,
              ic_title6: result[0].ic_title6,
              ic_image6: result[0].ic_image6,
              twitter: result[0].twitter,
              facebook: result[0].facebook,
              linkedin: result[0].linkedin,
              instagram: result[0].instagram,
              youtube: result[0].youtube,
              github: result[0].github,
              email: result[0].email,
              g_image1: result[0].g_image1,
              g_image2: result[0].g_image2,
              g_image3: result[0].g_image3,
              g_image4: result[0].g_image4,
              g_image5: result[0].g_image5,
              g_image6: result[0].g_image6,
              g_image7: result[0].g_image7,
              g_image8: result[0].g_image8,
            };
            res.status(200).send(dataToSend);
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal server error." });
    });
};

const setupBasic = async (req, res) => {
  const { page_title, full_name, page_link, biography } = req.body;

  if (!page_title || !full_name || !page_link || !biography) {
    return res
      .status(400)
      .send("Please provide required information in the request");
  }

  const newBasicInfo = {
    page_title,
    full_name,
    page_link,
    biography,
    user_id: req.user.id,
  };

  try {
    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    if (existingProfile) {
      return res.status(409).send("Profile already exists for this user");
    }

    await knex("profile").insert(newBasicInfo);

    console.log("hey");
    res.status(201).send("Basic Info added successfully");
  } catch (error) {
    console.log(error);
    res.status(400).send("Unable to create basic info for the user");
  }
};

const updateBasic = async (req, res) => {
  const { page_title, full_name, page_link, biography } = req.body;

  if (!page_title || !full_name || !page_link || !biography) {
    return res
      .status(400)
      .send("Please provide required information in the request");
  }

  const newBasicInfo = {
    page_title,
    full_name,
    page_link,
    biography,
  };
  try {
    const existingUser = await knex("user").where({ id: req.user.id }).first();
    console.log(req.user);

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    if (existingProfile) {
      await knex("profile")
        .where({ user_id: req.user.id })
        .update(newBasicInfo);
    } else {
      newBasicInfo.user_id = req.user.id;
      await knex("profile").insert(newBasicInfo);
    }

    res.status(200).send("Basic Info updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to update basic info for the user");
  }
};

const updateImages = async (req, res) => {
  const profile_image =
    req.file && req.file.filename ? req.file.filename : undefined;
  const hero_image = req.body.hero_image;

  const updateInfo = {
    hero_image,
  };

  if (profile_image) {
    updateInfo.profile_image = profile_image;
  }

  try {
    const existingUser = await knex("user").where({ id: req.user.id }).first();
    console.log(req.user);

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    if (existingProfile) {
      await knex("profile").where({ user_id: req.user.id }).update(updateInfo);
    } else {
      updateInfo.user_id = req.user.id;
      await knex("profile").insert(updateInfo);
    }

    res.status(200).send("Basic Info updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to update basic info for the user");
  }
};

const updateSocials = async (req, res) => {
  const { twitter, facebook, linkedin, instagram, youtube, github, email } =
    req.body;

  const updatedSocials = {
    twitter,
    facebook,
    linkedin,
    instagram,
    youtube,
    github,
    email,
  };

  try {
    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    if (!existingProfile) {
      return res.status(404).send("Profile not found");
    }

    const updatedRowCount = await knex("socials")
      .where({ profile_id: existingProfile.id })
      .update(updatedSocials);

    if (updatedRowCount === 0) {
      updatedSocials.profile_id = existingProfile.id;
      await knex("socials").insert(updatedSocials);
    }

    res.status(200).send("Socials updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to update socials");
  }
};

const updateExternalLinks = async (req, res) => {
  const {
    ext_link1,
    ext_title1,
    ext_link2,
    ext_title2,
    ext_link3,
    ext_title3,
    ext_link4,
    ext_title4,
  } = req.body;

  const updatedLinks = {
    ext_link1,
    ext_title1,
    ext_link2,
    ext_title2,
    ext_link3,
    ext_title3,
    ext_link4,
    ext_title4,
  };

  try {
    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    if (!existingProfile) {
      return res.status(404).send("Profile not found");
    }

    const updatedRowCount = await knex("links")
      .where({ profile_id: existingProfile.id })
      .update(updatedLinks);

    if (updatedRowCount === 0) {
      updatedLinks.profile_id = existingProfile.id;
      await knex("links").insert(updatedLinks);
    }

    res.status(200).send("External link updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to update external links");
  }
};

const updateImageCards = async (req, res) => {
  const ic_link1 = req.body.ic_link1;
  const ic_title1 = req.body.ic_title1;
  const ic_image1 =
    req.files && req.files.image1 && req.files.image1[0]
      ? req.files.image1[0].filename
      : undefined;
  const ic_link2 = req.body.ic_link2;
  const ic_title2 = req.body.ic_title2;
  const ic_image2 =
    req.files.image2 && req.files.image2[0]
      ? req.files.image2[0].filename
      : undefined;
  const ic_link3 = req.body.ic_link3;
  const ic_title3 = req.body.ic_title3;
  const ic_image3 =
    req.files.image3 && req.files.image3[0]
      ? req.files.image3[0].filename
      : undefined;
  const ic_link4 = req.body.ic_link4;
  const ic_title4 = req.body.ic_title4;
  const ic_image4 =
    req.files.image4 && req.files.image4[0]
      ? req.files.image4[0].filename
      : undefined;

  console.log(req.files);

  const updatedImageCards = {
    ic_link1,
    ic_title1,
    ic_link2,
    ic_title2,
    ic_link3,
    ic_title3,
    ic_link4,
    ic_title4,
  };

  if (ic_image1) {
    updatedImageCards.ic_image1 = ic_image1;
  }

  if (ic_image2) {
    updatedImageCards.ic_image2 = ic_image2;
  }

  if (ic_image3) {
    updatedImageCards.ic_image3 = ic_image3;
  }

  if (ic_image4) {
    updatedImageCards.ic_image4 = ic_image4;
  }

  try {
    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    if (!existingProfile) {
      return res.status(404).send("Profile not found");
    }

    const updatedRowCount = await knex("imagecards")
      .where({ profile_id: existingProfile.id })
      .update(updatedImageCards);

    if (updatedRowCount === 0) {
      updatedImageCards.profile_id = existingProfile.id;
      await knex("imagecards").insert(updatedImageCards);
    }

    res.status(200).send("Image Cards updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to update Image Cards");
  }
};

const updateGallery = async (req, res) => {
  const g_image1 =
    req.files && req.files.image1 && req.files.image1[0]
      ? req.files.image1[0].filename
      : undefined;
  const g_image2 =
    req.files && req.files.image2 && req.files.image2[0]
      ? req.files.image2[0].filename
      : undefined;
  const g_image3 =
    req.files && req.files.image3 && req.files.image3[0]
      ? req.files.image3[0].filename
      : undefined;
  const g_image4 =
    req.files && req.files.image4 && req.files.image4[0]
      ? req.files.image4[0].filename
      : undefined;
  const g_image5 =
    req.files && req.files.image5 && req.files.image5[0]
      ? req.files.image5[0].filename
      : undefined;
  const g_image6 =
    req.files && req.files.image6 && req.files.image6[0]
      ? req.files.image6[0].filename
      : undefined;

  console.log(req.files);

  const updatedGalleryImages = {};

  if (g_image1) {
    updatedGalleryImages.g_image1 = g_image1;
  }

  if (g_image2) {
    updatedGalleryImages.g_image2 = g_image2;
  }

  if (g_image3) {
    updatedGalleryImages.g_image3 = g_image3;
  }

  if (g_image4) {
    updatedGalleryImages.g_image4 = g_image4;
  }

  if (g_image5) {
    updatedGalleryImages.g_image5 = g_image5;
  }

  if (g_image6) {
    updatedGalleryImages.g_image6 = g_image6;
  }

  try {
    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    if (!existingProfile) {
      return res.status(404).send("Profile not found");
    }

    const isEmpty = Object.keys(updatedGalleryImages).length === 0;

    if (!isEmpty) {
      const updatedRowCount = await knex("gallery")
        .where({ profile_id: existingProfile.id })
        .update(updatedGalleryImages);

      if (updatedRowCount === 0) {
        updatedGalleryImages.profile_id = existingProfile.id;
        await knex("gallery").insert(updatedGalleryImages);
      }
    }

    res.status(200).send("Gallery updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to update Gallery");
  }
};

const updateTheme = async (req, res) => {
  const { style, color, font } = req.body;

  const updatedTheme = {
    style,
    color,
    font,
  };

  try {
    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    if (!existingProfile) {
      return res.status(404).send("Profile not found");
    }

    const updatedRowCount = await knex("theme")
      .where({ profile_id: existingProfile.id })
      .update(updatedTheme);

    if (updatedRowCount === 0) {
      updatedTheme.profile_id = existingProfile.id;
      await knex("theme").insert(updatedTheme);
    }

    res.status(200).send("Theme  updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to update Theme");
  }
};

const getBasicData = (req, res) => {
  knex("profile")
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => res.status(400).send(`Error retrieving users: ${err}`));
};

const setupImages = async (req, res) => {
  try {
    const profile_image = req.file.filename;
    const hero_image = req.body.hero_image;

    const updateInfo = {
      profile_image,
      hero_image,
    };

    console.log(req.file);

    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    if (!existingProfile) {
      return res.status(404).send("Profile not found for this user");
    }

    await knex("profile").where({ user_id: req.user.id }).update(updateInfo);

    res.status(200).send("Photos updated successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Unable to update photos for the user");
  }
};

const setupSocial = async (req, res) => {
  try {
    const { twitter, facebook, linkedin, instagram, youtube, github, email } =
      req.body;
    console.log(req.body);

    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    console.log(existingProfile);

    const newSocialInfo = {
      twitter,
      facebook,
      linkedin,
      instagram,
      youtube,
      github,
      email,
      profile_id: existingProfile.id,
    };

    await knex("socials").insert(newSocialInfo);

    console.log("Social info added successfully");
    res.status(200).send("Social info added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to create social info for the user");
  }
};

const setupLinks = async (req, res) => {
  try {
    const {
      ext_link1,
      ext_title1,
      ext_link2,
      ext_title2,
      ext_link3,
      ext_title3,
      ext_link4,
      ext_title4,
    } = req.body;
    console.log(req.body);

    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    console.log(existingProfile);

    const newLinks = {
      ext_link1,
      ext_title1,
      ext_link2,
      ext_title2,
      ext_link3,
      ext_title3,
      ext_link4,
      ext_title4,
      profile_id: existingProfile.id,
    };

    await knex("links").insert(newLinks);

    console.log("External links added successfully");
    res.status(200).send("External links added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to create external links for the user");
  }
};

const setupImageCards = async (req, res) => {
  try {
    const ic_link1 = req.body.ic_link1;
    const ic_title1 = req.body.ic_title1;
    const ic_image1 =
      req.files && req.files.image1 && req.files.image1[0]
        ? req.files.image1[0].filename
        : undefined;
    const ic_link2 = req.body.ic_link2;
    const ic_title2 = req.body.ic_title2;
    const ic_image2 =
      req.files.image2 && req.files.image2[0]
        ? req.files.image2[0].filename
        : undefined;
    const ic_link3 = req.body.ic_link3;
    const ic_title3 = req.body.ic_title3;
    const ic_image3 =
      req.files.image3 && req.files.image3[0]
        ? req.files.image3[0].filename
        : undefined;
    const ic_link4 = req.body.ic_link4;
    const ic_title4 = req.body.ic_title4;
    const ic_image4 =
      req.files.image4 && req.files.image4[0]
        ? req.files.image4[0].filename
        : undefined;

    console.log(req.files);

    const updatedImageCards = {
      ic_link1,
      ic_title1,
      ic_link2,
      ic_title2,
      ic_link3,
      ic_title3,
      ic_link4,
      ic_title4,
    };

    if (ic_image1) {
      updatedImageCards.ic_image1 = ic_image1;
    }

    if (ic_image2) {
      updatedImageCards.ic_image2 = ic_image2;
    }

    if (ic_image3) {
      updatedImageCards.ic_image3 = ic_image3;
    }

    if (ic_image4) {
      updatedImageCards.ic_image4 = ic_image4;
    }

    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    console.log(existingProfile);

    const newImageCards = {
      ic_link1,
      ic_title1,
      ic_image1,
      ic_link2,
      ic_title2,
      ic_image2,
      ic_link3,
      ic_title3,
      ic_image3,
      ic_link4,
      ic_title4,
      ic_image4,
      profile_id: existingProfile.id,
    };

    await knex("imagecards").insert(newImageCards);

    console.log("Image cards added successfully");
    res.status(200).send("Image cards added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to create Image cards for the user");
  }
};

const setupGalleryImages = async (req, res) => {
  try {
    const g_image1 =
      req.files && req.files.image1 && req.files.image1[0]
        ? req.files.image1[0].filename
        : undefined;
    const g_image2 =
      req.files.image2 && req.files.image2[0]
        ? req.files.image2[0].filename
        : undefined;
    const g_image3 =
      req.files.image3 && req.files.image3[0]
        ? req.files.image3[0].filename
        : undefined;
    const g_image4 =
      req.files.image4 && req.files.image4[0]
        ? req.files.image4[0].filename
        : undefined;

    const g_image5 =
      req.files.image5 && req.files.image5[0]
        ? req.files.image5[0].filename
        : undefined;
    const g_image6 =
      req.files.image6 && req.files.image6[0]
        ? req.files.image6[0].filename
        : undefined;

    console.log(req.files);

    const updatedGalleryImages = {};

    if (g_image1) {
      updatedGalleryImages.g_image1 = g_image1;
    }

    if (g_image2) {
      updatedGalleryImages.g_image2 = g_image2;
    }

    if (g_image3) {
      updatedGalleryImages.g_image3 = g_image3;
    }

    if (g_image4) {
      updatedGalleryImages.g_image4 = g_image4;
    }

    if (g_image5) {
      updatedGalleryImages.g_image4 = g_image4;
    }

    if (g_image6) {
      updatedGalleryImages.g_image6 = g_image6;
    }

    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    console.log(existingProfile);

    const newGalleryImages = {
      g_image1,
      g_image2,
      g_image3,
      g_image4,
      g_image5,
      g_image6,
      profile_id: existingProfile.id,
    };

    await knex("gallery").insert(newGalleryImages);

    console.log("Gallery Images added successfully");
    res.status(200).send("Gallery Images added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to create Gallery Images for the user");
  }
};

const setupTheme = async (req, res) => {
  try {
    const { style, color, font } = req.body;
    console.log(req.body);

    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    console.log(existingProfile);

    const newTheme = {
      style,
      color,
      font,
      profile_id: existingProfile.id,
    };

    await knex("theme").insert(newTheme);

    console.log("Theme added successfully");
    res.status(200).send("Theme added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to add Theme for the user");
  }
};

module.exports = {
  index,
  create,
  login,
  findUser,
  getProfile,
  getProfileEdit,
  setupBasic,
  updateBasic,
  updateImages,
  updateSocials,
  updateExternalLinks,
  updateImageCards,
  updateGallery,
  updateTheme,
  getBasicData,
  setupImages,
  setupSocial,
  setupLinks,
  setupImageCards,
  setupGalleryImages,
  setupTheme,
};
