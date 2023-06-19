const knex = require("knex")(require("../knexfile"));
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");

// Post request to get all users
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
  res.json({ token });
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
    const { link1, title1, link2, title2, link3, title3, link4, title4 } =
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

    const newLinks = {
      link1,
      title1,
      link2,
      title2,
      link3,
      title3,
      link4,
      title4,
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
      link1,
      title1,
      image1,
      link2,
      title2,
      image2,
      link3,
      title3,
      image3,
      link4,
      title4,
      image4,
      link5,
      title5,
      image5,
      link6,
      title6,
      image6,
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
      link1,
      title1,
      image1,
      link2,
      title2,
      image2,
      link3,
      title3,
      image3,
      link4,
      title4,
      image4,
      link5,
      title5,
      image5,
      link6,
      title6,
      image6,
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
    const { image1, image2, image3, image4, image5, image6 } = req.body;
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
      image1,
      image2,
      image3,
      image4,
      image5,
      image6,
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

module.exports = {
  index,
  create,
  login,
  findUser,
  setupBasic,
  setupImages,
  setupSocial,
  setupLinks,
  setupImageCards,
  setupGalleryImages,
  setupTheme,
};
