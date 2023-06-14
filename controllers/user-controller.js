const knex = require("knex")(require("../knexfile"));

// Post request to get all users
const index = (req, res) => {
  knex("user")
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => res.status(400).send(`Error retrieving users: ${err}`));
};

// Post request to create user
const create = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .send("Please provide required information in the request");
  }

  const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!req.body.email.match(mailformat)) {
    return res.status(400).send("Please provide a valid email");
  }

  knex("user")
    .insert(req.body)
    .then((result) => {
      return knex("user").where({ id: result[0] });
    })
    .then((createdUser) => {
      res.status(201).json(createdUser[0]);
    })
    .catch(() => {
      res.status(500).json({ message: "Unable to create new user" });
    });
};

//Get a user by username
const findUser = (req, res) => {
  knex("user")
    .where({ id: req.params.id })
    .then((usersFound) => {
      if (usersFound.length === 0) {
        return res
          .status(404)
          .json({ message: `User with ID ${req.params.id} not found` });
      }

      const userData = usersFound[0];
      res.status(200).json(userData);
    })
    .catch(() => {
      res.status(500).json({
        message: `Unable to retrieve user data for user with ID ${req.params.id}`,
      });
    });
};

// //Patch/Edit only user password
// const update = (req, res) => {
//   knex("user")
//     .where({ id: req.params.id })
//     .update(req.body)
//     .then((affectedRows) => {
//       if (affectedRows === 0) {
//         return res.status(400).send("Failed to update user. Do they exist?");
//       }

//       return knex("user").where({ id: req.params.id });
//     })
//     .then((updatedUser) => {
//       res.json(updatedUser[0]);
//     })
//     .catch(() => {
//       res
//         .status(500)
//         .json({ message: `Unable to update user with ID: ${req.params.id}` });
//     });
// };

module.exports = {
  index,
  create,
  findUser,
};
