"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const pinHash = await bcrypt.hash("1234", 10);
    const { Op } = Sequelize;

    // Delete in order of dependencies to avoid foreign key constraint violations
    // First delete records that reference others (child tables)
    await queryInterface.bulkDelete("redemptions", {}, {});
    await queryInterface.bulkDelete("transactions", {}, {});
    
    // Then delete parent tables
    await queryInterface.bulkDelete(
      "rewards",
      { name: { [Op.in]: ["Free Bread", "$5 Off"] } },
      {}
    );
    await queryInterface.bulkDelete(
      "staff_users",
      { name: "Admin", role: "admin" },
      {}
    );
    await queryInterface.bulkDelete(
      "loyalty_config",
      { earn_rate: 1.0 },
      {}
    );

    await queryInterface.bulkInsert(
      "loyalty_config",
      [
        {
          earn_rate: 1.0,
          created_at: now,
          updated_at: now
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "staff_users",
      [
        {
          id: Sequelize.literal("gen_random_uuid()"),
          name: "Admin",
          role: "admin",
          is_active: true,
          pin_hash: pinHash,
          created_at: now,
          updated_at: now
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "rewards",
      [
        {
          id: Sequelize.literal("gen_random_uuid()"),
          name: "Free Bread",
          points_cost: 200,
          is_active: true,
          created_at: now,
          updated_at: now
        },
        {
          id: Sequelize.literal("gen_random_uuid()"),
          name: "$5 Off",
          points_cost: 100,
          is_active: true,
          created_at: now,
          updated_at: now
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;

    // Delete in order of dependencies to avoid foreign key constraint violations
    await queryInterface.bulkDelete("redemptions", {}, {});
    await queryInterface.bulkDelete("transactions", {}, {});
    
    await queryInterface.bulkDelete(
      "rewards",
      { name: { [Op.in]: ["Free Bread", "$5 Off"] } },
      {}
    );
    await queryInterface.bulkDelete(
      "staff_users",
      { name: "Admin", role: "admin" },
      {}
    );
    await queryInterface.bulkDelete(
      "loyalty_config",
      { earn_rate: 1.0 },
      {}
    );
  }
};
