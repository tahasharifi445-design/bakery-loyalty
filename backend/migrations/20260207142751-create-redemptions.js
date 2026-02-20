"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("redemptions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "customers", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
      },
      staff_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "staff_users", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
      },
      reward_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "rewards", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
      },
      points_spent: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });

    await queryInterface.addIndex("redemptions", ["customer_id", "created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("redemptions");
  }
};
