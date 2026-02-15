import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

interface LoyaltyConfigAttributes {
  id: number;
  earn_rate: number;
  created_at: Date;
  updated_at: Date;
}

type LoyaltyConfigCreationAttributes = Optional<
  LoyaltyConfigAttributes,
  "id" | "created_at" | "updated_at"
>;

export class LoyaltyConfig extends Model<
  LoyaltyConfigAttributes,
  LoyaltyConfigCreationAttributes
> {
  declare id: number;
  declare earn_rate: number;
  declare created_at: Date;
  declare updated_at: Date;
}

LoyaltyConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    earn_rate: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 1.0,
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
    tableName: "loyalty_config",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
