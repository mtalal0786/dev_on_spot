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
