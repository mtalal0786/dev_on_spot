import fetch from 'node-fetch';

/**
 * @desc    Check domain availability using the RapidAPI Domainr service.
 * This function queries the '/v2/search' endpoint and returns
 * whether the specified domain is available.
 * @route   GET /api/domains/check-availability?name=example.com
 * @access  Public
 */
export const checkDomainAvailability = async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ message: 'Domain name is required' });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST;

  if (!rapidApiKey || rapidApiKey === '' || !rapidApiHost || rapidApiHost === '') {
    console.error('RapidAPI keys or host are not configured in environment variables.');
    return res.status(500).json({ message: 'RapidAPI keys or host are not configured.' });
  }

  const url = `https://${rapidApiHost}/v2/search?query=${name}`;

  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': rapidApiHost
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    // Check if the API call was successful
    if (!response.ok) {
        throw new Error(result.message || 'API call failed');
    }

    let isAvailable = false;
    let message = 'Domain is unavailable';

    // Find the exact domain in the results and check its status.
    // The API response indicates a domain is available if 'tld_unavailable' is true.
    const exactMatch = result.results.find(d => d.domain === name);

    if (exactMatch) {
      if (exactMatch.tld_unavailable) {
        isAvailable = true;
        message = 'Domain is available';
      }
    } else {
      // If no exact match is found, assume it's available.
      isAvailable = true;
      message = 'Domain is available';
    }

    res.status(200).json({
      name,
      isAvailable,
      message,
    });
  } catch (error) {
    console.error(`Error checking domain availability with RapidAPI:`, error);
    res.status(500).json({
      message: 'Failed to check domain availability. Please try again later.'
    });
  }
};

/**
 * @desc    Redirects the client to the registrar's website to complete
 * the domain registration process by directly calling the
 * /v2/register endpoint.
 * @route   POST /api/domains/register
 * @access  Public
 */
export const registerDomain = async (req, res) => {
  const { domain, registrar } = req.body;

  // Add this console.log to see the values received by your API
  console.log(`Received request for domain: ${domain} and registrar: ${registrar}`);

  if (!domain || !registrar) {
    return res.status(400).json({ message: 'Domain and registrar are required' });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST;

  if (!rapidApiKey || rapidApiKey === '' || !rapidApiHost || rapidApiHost === '') {
    console.error('RapidAPI keys or host are not configured in environment variables.');
    return res.status(500).json({ message: 'RapidAPI keys or host are not configured.' });
  }

  // Use the dedicated /v2/register endpoint which responds with a 302 redirect.
  const registerUrl = `https://${rapidApiHost}/v2/register?domain=${domain}&registrar=${registrar}`;

  // Redirect the client to the constructed URL.
  // The API will handle the 302 response, so we don't need a fetch call here.
  res.redirect(registerUrl); 
  
};

// domainController.js

import Domain from '../models/domain.js'; // Import the updated Mongoose model
import mongoose from 'mongoose';

/**
 * @fileoverview Updated Domain CRUD controller.
 * This file contains the logic for handling all domain-related operations,
 * including the new fields for purchased plan and expiration date.
 */

// --- Helper function to check for valid MongoDB ObjectId ---
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- Helper function to calculate expiration date ---
const calculateExpirationDate = (plan) => {
  const currentDate = new Date();
  switch (plan) {
    case '1 month':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
    case '6 months':
      currentDate.setMonth(currentDate.getMonth() + 6);
      break;
    case '1 year':
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      break;
    case '2 years':
      currentDate.setFullYear(currentDate.getFullYear() + 2);
      break;
    case '5 years':
      currentDate.setFullYear(currentDate.getFullYear() + 5);
      break;
    default:
      // Default to 1 year if the plan is invalid
      currentDate.setFullYear(currentDate.getFullYear() + 1);
  }
  return currentDate;
};

// --- CREATE a new domain entry ---
export const createDomain = async (req, res) => {
  try {
    // For now, hardcode user email. This will be replaced with
    // a proper authentication system that links to a user schema.
    const userEmail = 'mainuser@example.com';

    // Destructure required fields from the request body
    const {
      domain_provider_name,
      domain_name,
      ssl_purchased,
      domain_status,
      purchased_plan,
    } = req.body;

    // Check if required fields are present
    if (!domain_provider_name || !domain_name || !domain_status || !purchased_plan) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Calculate the expiration date based on the purchased plan
    const expiration_date = calculateExpirationDate(purchased_plan);

    // Create a new domain instance with all required fields
    const newDomain = new Domain({
      user_email: userEmail,
      domain_provider_name,
      domain_name,
      ssl_purchased,
      domain_status,
      purchased_plan,
      expiration_date, // Add the calculated expiration date
    });

    // Save the new domain entry to the database
    const savedDomain = await newDomain.save();

    // Respond with a 201 Created status and the new domain data
    res.status(201).json(savedDomain);
  } catch (error) {
    // Handle specific MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A domain with this name already exists.' });
    }
    // Handle other server errors
    console.error('Error creating domain:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- READ all domain entries ---
export const getAllDomains = async (req, res) => {
  try {
    // Find all documents in the 'domains' collection
    const domains = await Domain.find();
    // Respond with the list of domains
    res.status(200).json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- READ a single domain entry by ID ---
export const getDomainById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the incoming ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid domain ID.' });
    }

    // Find a domain by its ID
    const domain = await Domain.findById(id);

    // If no domain is found, return a 404 Not Found error
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    // Respond with the found domain data
    res.status(200).json(domain);
  } catch (error) {
    console.error('Error fetching domain by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- UPDATE a domain entry by ID ---
export const updateDomain = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the incoming ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid domain ID.' });
    }

    // Find the domain and update it with the new data from the request body.
    const updatedDomain = await Domain.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // runValidators ensures schema validation is applied on update
    );

    // If no domain is found, return a 404 Not Found error
    if (!updatedDomain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    // Respond with the updated domain data
    res.status(200).json(updatedDomain);
  } catch (error) {
    console.error('Error updating domain:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- DELETE a domain entry by ID ---
export const deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the incoming ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid domain ID.' });
    }

    // Find the domain and delete it
    const deletedDomain = await Domain.findByIdAndDelete(id);

    // If no domain is found, return a 404 Not Found error
    if (!deletedDomain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Domain deleted successfully.' });
  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
