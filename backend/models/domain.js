// domain.js

import mongoose, { Schema } from 'mongoose';

/**
 * @fileoverview Updated Domain Schema for MongoDB.
 * This schema defines the structure for storing domain-related information,
 * now including the purchased plan and the calculated expiration date.
 */

// Define the schema for a domain
const domainSchema = new Schema({
  // The email of the user who owns this domain entry.
  user_email: {
    type: String,
    required: true,
  },
  // The name of the domain provider (e.g., GoDaddy, Namecheap).
  domain_provider_name: {
    type: String,
    required: true,
  },
  // The domain name itself (e.g., example.com).
  domain_name: {
    type: String,
    required: true,
    unique: true,
  },
  // A boolean to indicate whether an SSL certificate has been purchased.
  ssl_purchased: {
    type: Boolean,
    default: false,
  },
  // The current status of the domain.
  domain_status: {
    type: String,
    required: true,
  },
  // The duration of the purchased plan (e.g., '1 year', '6 months').
  // Using an enum provides better data validation and consistency.
  purchased_plan: {
    type: String,
    required: true,
    enum: ['1 month', '6 months', '1 year', '2 years', '5 years']
  },
  // The date when the domain registration will expire.
  // This value will be calculated based on the 'createdAt' and 'purchased_plan'
  // fields in the backend controller or service.
  expiration_date: {
    type: Date,
    required: true,
  },
}, {
  // The 'timestamps: true' option automatically adds 'createdAt' and 'updatedAt'
  // fields. 'createdAt' serves as your registration date.
  timestamps: true,
});

// Create and export the Mongoose model for the Domain schema.
const Domain = mongoose.model('Domain', domainSchema);
export default Domain;
