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
      table.string("biography", 1000);
      table.string("page_link", 1000);
      table.string("profile_image");
      table.string("hero_image");
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
      table.string("twitter");
      table.string("facebook");
      table.string("linkedin");
      table.string("instagram");
      table.string("youtube");
      table.string("github");
      table.string("email");
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
      table.string("ext_link1");
      table.string("ext_title1");
      table.string("ext_link2");
      table.string("ext_title2");
      table.string("ext_link3");
      table.string("ext_title3");
      table.string("ext_link4");
      table.string("ext_title4");
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
    .createTable("imagecards", (table) => {
      table.increments("id").primary();
      table.string("ic_link1");
      table.string("ic_title1");
      table.string("ic_image1");
      table.string("ic_link2");
      table.string("ic_title2");
      table.string("ic_image2");
      table.string("ic_link3");
      table.string("ic_title3");
      table.string("ic_image3");
      table.string("ic_link4");
      table.string("ic_title4");
      table.string("ic_image4");
      table.string("ic_link5");
      table.string("ic_title5");
      table.string("ic_image5");
      table.string("ic_link6");
      table.string("ic_title6");
      table.string("ic_image6");
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
    .createTable("gallery", (table) => {
      table.increments("id").primary();
      table.string("g_image1");
      table.string("g_image2");
      table.string("g_image3");
      table.string("g_image4");
      table.string("g_image5");
      table.string("g_image6");
      table.string("g_image7");
      table.string("g_image8");
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
    .dropTable("gallery")
    .dropTable("imagecards")
    .dropTable("links")
    .dropTable("socials")
    .dropTable("profile")
    .dropTable("user");
};
