import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../db";

interface RewardAttributes {
  id: string;
  name: string;
  points_cost: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

type RewardCreationAttributes = Optional<
  RewardAttributes,
  "id" | "is_active" | "created_at" | "updated_at"
>;

export class Reward extends Model<
  RewardAttributes,
  RewardCreationAttributes
> {
  declare id: string;
  declare name: string;
  declare points_cost: number;
  declare is_active: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

Reward.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    points_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "rewards",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
