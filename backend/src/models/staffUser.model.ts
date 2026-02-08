import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { sequelize } from "../db";

export type StaffUserRole = "staff" | "admin";

interface StaffUserAttributes {
  id: string;
  name: string;
  pin_hash: string;
  role: StaffUserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

type StaffUserCreationAttributes = Optional<
  StaffUserAttributes,
  "id" | "created_at" | "updated_at"
>;

export class StaffUser extends Model<
  StaffUserAttributes,
  StaffUserCreationAttributes
> {
  declare id: string;
  declare name: string;
  declare pin_hash: string;
  declare role: StaffUserRole;
  declare is_active: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

StaffUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pin_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("staff", "admin"),
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
    tableName: "staff_users",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
