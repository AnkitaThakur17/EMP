const mongoose = require("mongoose");
const tableConstants = require("../constants/tableConstants");

//User Schema for MongoDB
const usersSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      maxlength: 100,
    },
    email: {
      type: String,
      maxlength: 150,
      unique: true,
      index: true
    },
    password: {
      type: String,
      maxlength: 100,
    },
    designation: {
      type: String,
      maxlength: 150,
    },
    employeeCode: {
      type: String,
    },
    team: {
      type: String,
      maxlength: 100,
    },
    dob: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
    subrole: {
      type: String,
      enum: ["HR", "TL", "none",""],
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Export the model
const UsersSchema = mongoose.model(tableConstants.USERS, usersSchema);

module.exports = UsersSchema;
