import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../db";

interface RedemptionAttributes {
  id: string;
  customer_id: string;
  reward_id: string;
  staff_user_id: string;
  points_spent: number;
  created_at: Date;
  updated_at: Date;
}

type RedemptionCreationAttributes = Optional<
  RedemptionAttributes,
  "id" | "created_at" | "updated_at"
>;

export class Redemption extends Model<
  RedemptionAttributes,
  RedemptionCreationAttributes
> {
  declare id: string;
  declare customer_id: string;
  declare reward_id: string;
  declare staff_user_id: string;
  declare points_spent: number;
  declare created_at: Date;
  declare updated_at: Date;
}

Redemption.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reward_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    staff_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    points_spent: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "redemptions",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
