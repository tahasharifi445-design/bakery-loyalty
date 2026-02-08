import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

export const sequelize = new Sequelize(databaseUrl ?? "", {
  dialect: "postgres",
  logging: false,
});

export const connectDb = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");
  } catch (error) {
    console.error("Database connection failed", error);
    throw error;
  }
};
