import fetch from 'node-fetch';
import Domain from '../models/domain.js'; // Import the updated Mongoose model
import mongoose from 'mongoose';

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
    const exactMatch = result.results.find(d => d.domain === name);

    if (exactMatch) {
      if (exactMatch.tld_unavailable) {
        isAvailable = true;
        message = 'Domain is available';
      }
    } else {
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

  const registerUrl = `https://${rapidApiHost}/v2/register?domain=${domain}&registrar=${registrar}`;

  // Redirect the client to the registrar's URL
  res.redirect(registerUrl);
};

/**
 * @desc    Helper function to check for valid MongoDB ObjectId
 * @param   {string} id - The ID to check
 * @returns {boolean} - Returns true if valid, false otherwise
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc    Helper function to calculate expiration date based on the plan
 * @param   {string} plan - The domain's purchased plan (e.g., '1 month', '1 year')
 * @returns {Date} - The calculated expiration date
 */
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
      currentDate.setFullYear(currentDate.getFullYear() + 1); // Default to 1 year if invalid
  }
  return currentDate;
};

/**
 * @desc    CREATE a new domain entry in the database
 * @route   POST /api/domains
 * @access  Public
 */
export const createDomain = async (req, res) => {
  try {
    const { domain_provider_name, domain_name, ssl_purchased, domain_status, purchased_plan } = req.body;

    if (!domain_provider_name || !domain_name || !domain_status || !purchased_plan) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const expiration_date = calculateExpirationDate(purchased_plan);

    const newDomain = new Domain({
      user_email: 'mainuser@example.com', // Replace with actual user email
      domain_provider_name,
      domain_name,
      ssl_purchased,
      domain_status,
      purchased_plan,
      expiration_date,
    });

    const savedDomain = await newDomain.save();

    res.status(201).json(savedDomain);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A domain with this name already exists.' });
    }
    console.error('Error creating domain:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    READ all domain entries from the database
 * @route   GET /api/domains
 * @access  Public
 */
export const getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.find();
    res.status(200).json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    READ a single domain entry by its ID
 * @route   GET /api/domains/:id
 * @access  Public
 */
export const getDomainById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid domain ID.' });
    }

    const domain = await Domain.findById(id);

    if (!domain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    res.status(200).json(domain);
  } catch (error) {
    console.error('Error fetching domain by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    UPDATE a domain entry by its ID
 * @route   PUT /api/domains/:id
 * @access  Public
 */
export const updateDomain = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid domain ID.' });
    }

    const updatedDomain = await Domain.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedDomain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    res.status(200).json(updatedDomain);
  } catch (error) {
    console.error('Error updating domain:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    DELETE a domain entry by its ID
 * @route   DELETE /api/domains/:id
 * @access  Public
 */
export const deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid domain ID.' });
    }

    const deletedDomain = await Domain.findByIdAndDelete(id);

    if (!deletedDomain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    res.status(200).json({ message: 'Domain deleted successfully.' });
  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
