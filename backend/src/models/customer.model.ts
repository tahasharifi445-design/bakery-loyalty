import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../db";

interface CustomerAttributes {
  id: string;
  name: string | null;
  phone_number: string;
  points_balance: number;
  created_at: Date;
  updated_at: Date;
}

type CustomerCreationAttributes = Optional<
  CustomerAttributes,
  "id" | "points_balance" | "created_at" | "updated_at"
>;

export class Customer extends Model<
  CustomerAttributes,
  CustomerCreationAttributes
> {
  declare id: string;
  declare name: string | null;
  declare phone_number: string;
  declare points_balance: number;
  declare created_at: Date;
  declare updated_at: Date;
}

Customer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    points_balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "customers",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
