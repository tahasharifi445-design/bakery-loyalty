import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../db";

interface TransactionAttributes {
  id: string;
  customer_id: string;
  staff_user_id: string;
  purchase_amount: number;
  points_awarded: number;
  created_at: Date;
  updated_at: Date;
}

type TransactionCreationAttributes = Optional<
  TransactionAttributes,
  "id" | "created_at" | "updated_at"
>;

export class Transaction extends Model<
  TransactionAttributes,
  TransactionCreationAttributes
> {
  declare id: string;
  declare customer_id: string;
  declare staff_user_id: string;
  declare purchase_amount: number;
  declare points_awarded: number;
  declare created_at: Date;
  declare updated_at: Date;
}

Transaction.init(
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
    staff_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    purchase_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    points_awarded: {
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
    tableName: "transactions",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
