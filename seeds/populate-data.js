const userData = require("../seed-data/users");
const profileData = require("../seed-data/profile");
const socialData = require("../seed-data/socials");
const linksData = require("../seed-data/links");
const themeData = require("../seed-data/theme");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("user").del();
  await knex("user").insert(userData);
  await knex("profile").del();
  await knex("profile").insert(profileData);
  await knex("socials").del();
  await knex("socials").insert(socialData);
  await knex("links").del();
  await knex("links").insert(linksData);
  await knex("theme").del();
  await knex("theme").insert(themeData);
};
