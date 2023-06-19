const knex = require("knex")(require("../knexfile"));

const index = (req, res) => {
  knex("profile")
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => res.status(400).send(`Error retrieving profiles: ${err}`));
};

// Create new profile page
const create = (req, res) => {
  if (
    !req.body.page_title ||
    !req.body.full_name ||
    !req.body.biography ||
    !req.body.profile_image ||
    !req.body.hero_image
  ) {
    return res
      .status(400)
      .send("Please provide required information in the request");
  }

  const checkUser = knex("user").where({ id: req.body.user_id });

  if (!checkUser.length) {
    return res.status(400).send(`User with an id ${req.body.user_id}`);
  }

  const addNewProfile = knex("profile")
    .insert(req.body)
    .then((result) => {
      return knex("profile").where({ id: result[0] });
    })
    .then((createdUser) => {
      res.status(201).json(createdUser[0]);
    })
    .catch(() => {
      res.status(500).json({ message: "Unable to create new profile" });
    });
};

module.exports = {
  index,
  create,
};
