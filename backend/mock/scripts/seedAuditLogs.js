// seedAuditLogs.js

import mongoose from "mongoose";
import AuditLog from "./models/AuditLog.js"; // Make sure the path to your model is correct

// Connect to MongoDB (replace with your actual database connection string)
const connectDb = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/yourdb', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

// Seed function
const seedAuditLogs = async () => {
  const auditLogs = [
    {
      user: "admin@example.com",
      action: "CREATE_RULE",
      resource: "SecurityRule:1a2b3c",
      changes: '{"field": "value"}',
      ip: "192.168.1.1",
      timestamp: new Date(),
    },
    {
      user: "system",
      action: "UPDATE_PLAN",
      resource: "Plan:12345",
      changes: '{"status": "active"}',
      ip: "192.168.1.2",
      timestamp: new Date(),
    },
    {
      user: "johndoe@example.com",
      action: "DELETE_USER",
      resource: "User:98765",
      changes: '{"reason": "User request"}',
      ip: "192.168.1.3",
      timestamp: new Date(),
    },
    {
      user: "janedoe@example.com",
      action: "CREATE_PLAN",
      resource: "Plan:54321",
      changes: '{"name": "Premium Plan"}',
      ip: "192.168.1.4",
      timestamp: new Date(),
    },
    // Add more logs as needed...
  ];

  // Insert the logs into MongoDB
  await AuditLog.insertMany(auditLogs);
  console.log("Audit logs seeded!");
};

// Run the seeding process
const run = async () => {
  await connectDb();
  await seedAuditLogs();
  mongoose.connection.close(); // Close the DB connection
};

run();
