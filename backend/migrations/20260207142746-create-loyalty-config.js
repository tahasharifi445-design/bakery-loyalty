"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("loyalty_config", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      earn_rate: { type: Sequelize.DECIMAL(10, 4), allowNull: false, defaultValue: 1.0 }, // points per $1
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("loyalty_config");
  }
};
