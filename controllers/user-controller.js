const knex = require("knex")(require("../knexfile"));
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");

//  request to get all users
const index = (req, res) => {
  knex("user")
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => res.status(400).send(`Error retrieving users: ${err}`));
};

// Post request to create user
const create = async (req, res) => {
  // Grab the data that's been posted
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

  // Insert it into the database
  try {
    await knex("user").insert(newUser);
    res.status(201).send("Registered successfully");
  } catch (error) {
    console.log(error);
    res.status(400).send("Unable to create new user");
  }
};

// ## POST /api/users/login
// -   Generates and responds a JWT for the user to use for future authorization.
// -   Expected body: { email, password }
// -   Response format: { token: "JWT_TOKEN_HERE" }
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please enter the required fields");
  }

  // Find the user
  const userAndProfile = await knex("user")
    .where({ email })
    .join("profile", "profile.user_id", "user.id")
    .first();

  const user = await knex("user").where({ email }).first();

  if (!user) {
    return res.status(400).send("Invalid email");
  }

  // Validate the password
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).send("Invalid password");
  }

  // Generate a token
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

// ## GET /api/user/current
// -   Gets information about the currently logged in user.
// -   Expects valid JWT authentication to run through the "authenticate" middleware
const findUser = async (req, res) => {
  console.log(req.body);
  // Respond with the appropriate user data
  // (because we're using "authorize" middleware, we have req.user)
  const user = await knex("user").where({ id: req.user.id }).first();
  // delete user.password;
  res.json(user);
};

//Get Profile by pageLink Params
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

//Get request for edit

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

// ## POST /api/user/setup
// -   Gets information about the currently logged in user.
// -   Expects valid JWT authentication to run through the "authenticate" middleware
const setupBasic = async (req, res) => {
  // Grab the data that's been posted
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
  // Grab the data that's been posted
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
  // Grab the data that's been posted
  const { profile_image, hero_image } = req.body;

  if (!profile_image || !hero_image) {
    return res
      .status(400)
      .send("Please provide required information in the request");
  }

  const newBasicInfo = {
    profile_image,
    hero_image,
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
  const {
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
    ic_link5,
    ic_title5,
    ic_image5,
    ic_link6,
    ic_title6,
    ic_image6,
  } = req.body;

  const updatedImageCards = {
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
    ic_link5,
    ic_title5,
    ic_image5,
    ic_link6,
    ic_title6,
    ic_image6,
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

    const updatedRowCount = await knex("imagecards")
      .where({ profile_id: existingProfile.id })
      .update(updatedImageCards);

    if (updatedRowCount === 0) {
      updatedImageCards.profile_id = existingProfile.id;
      await knex("imagecards").insert(updatedImageCards);
    }

    res.status(200).send("Image Cards  updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to update Image Cards");
  }
};

const updateGallery = async (req, res) => {
  const { g_image1, g_image2, g_image3, g_image4, g_image5, g_image6 } =
    req.body;

  const updatedGalleryImages = {
    g_image1,
    g_image2,
    g_image3,
    g_image4,
    g_image5,
    g_image6,
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

    const updatedRowCount = await knex("gallery")
      .where({ profile_id: existingProfile.id })
      .update(updatedGalleryImages);

    if (updatedRowCount === 0) {
      updatedGalleryImages.profile_id = existingProfile.id;
      await knex("gallery").insert(updatedGalleryImages);
    }

    res.status(200).send("Gallery  updated successfully");
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
    // Grab the data that's been posted
    const { profile_image, hero_image } = req.body;

    // if (!profile_image || !hero_image) {
    //   return res
    //     .status(400)
    //     .send("Please provide required information in the request");
    // }

    const updateInfo = {
      profile_image,
      hero_image,
    };

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

    console.log("hey");
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

    // if (existingProfile) {
    //   return res.status(409).send("Profile already exists for this user");
    // }

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

    // if (existingProfile) {
    //   return res.status(409).send("Profile already exists for this user");
    // }

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
    const {
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
      ic_link5,
      ic_title5,
      ic_image5,
      ic_link6,
      ic_title6,
      ic_image6,
    } = req.body;
    console.log(req.body);

    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    // if (existingProfile) {
    //   return res.status(409).send("Profile already exists for this user");
    // }

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
      ic_link5,
      ic_title5,
      ic_image5,
      ic_link6,
      ic_title6,
      ic_image6,
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
    const { g_image1, g_image2, g_image3, g_image4, g_image5, g_image6 } =
      req.body;
    console.log(req.body);

    const existingUser = await knex("user").where({ id: req.user.id }).first();

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    const existingProfile = await knex("profile")
      .where({ user_id: req.user.id })
      .first();

    // if (existingProfile) {
    //   return res.status(409).send("Profile already exists for this user");
    // }

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

    // if (existingProfile) {
    //   return res.status(409).send("Profile already exists for this user");
    // }

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

const imageUpload = async (req, res) => {
  // try {
  //   console.log(req.files);
  //   let profileImage;
  //   let heroImage;
  //   let uploadPath;
  //   if (!req.files || Object.keys(req.files).length === 0) {
  //     return res.status(400).send("No files were uploaded.");
  //   }
  //   // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  //   profileImage = req.files.profile_image;
  //   heroImage = req.files.hero_image;
  //   uploadPath = __dirname + "/files/" + profileImage.name;
  //   // Use the mv() method to place the file somewhere on your server
  //   profileImage.mv(uploadPath, function (err) {
  //     if (err) return res.status(500).send(err);
  //     res.send("File uploaded!");
  //   });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send("Unable to add Theme for the user");
  // }
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
  imageUpload,
};
