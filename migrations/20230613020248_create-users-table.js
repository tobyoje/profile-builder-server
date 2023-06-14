/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("user", (table) => {
      table.increments("id").primary();
      table.string("email").notNullable();
      table.string("password").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table
        .timestamp("updated_at")
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    })
    .createTable("profile", (table) => {
      table.increments("id").primary();
      table.string("page_title").notNullable();
      table.string("full_name").notNullable();
      table.string("biography", 1000).notNullable();
      table.string("profile_image").notNullable();
      table.string("hero_image").notNullable();
      table
        .integer("user_id")
        .unsigned()
        .references("user.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table
        .timestamp("updated_at")
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    })
    .createTable("socials", (table) => {
      table.increments("id").primary();
      table.string("twitter").notNullable();
      table.string("facebook").notNullable();
      table.string("linkedin").notNullable();
      table.string("instagram").notNullable();
      table.string("youtube").notNullable();
      table.string("github").notNullable();
      table.string("email").notNullable();
      table
        .integer("profile_id")
        .unsigned()
        .references("profile.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table
        .timestamp("updated_at")
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    })
    .createTable("links", (table) => {
      table.increments("id").primary();
      table.string("link").notNullable();
      table.string("title").notNullable();
      table
        .integer("profile_id")
        .unsigned()
        .references("profile.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table
        .timestamp("updated_at")
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    })
    .createTable("theme", (table) => {
      table.increments("id").primary();
      table.string("style").notNullable();
      table.string("color").notNullable();
      table.string("font").notNullable();
      table
        .integer("profile_id")
        .unsigned()
        .references("profile.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table
        .timestamp("updated_at")
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable("theme")
    .dropTable("links")
    .dropTable("socials")
    .dropTable("profile")
    .dropTable("user");
};
