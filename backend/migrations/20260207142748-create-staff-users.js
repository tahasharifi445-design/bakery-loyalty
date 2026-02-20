"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("staff_users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      pin_hash: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM("staff", "admin"), allowNull: false, defaultValue: "staff" },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("staff_users");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_staff_users_role";');
  }
};
