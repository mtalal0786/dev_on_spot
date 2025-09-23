// lib/api.js

// GET /api/security/overview
export const getOverview = async () => {
  const response = await fetch('/api/security/overview');
  if (!response.ok) throw new Error('Failed to fetch overview');
  return await response.json();
};

// GET /api/security/email-alerts
export const getEmailAlerts = async () => {
  const response = await fetch('/api/security/email-alerts');
  if (!response.ok) throw new Error('Failed to fetch email alerts');
  return await response.json();
};

// POST /api/security/email-alerts
export const setEmailAlerts = async (enabled) => {
  const response = await fetch('/api/security/email-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  if (!response.ok) throw new Error('Failed to update email alerts');
  return await response.json();
};

// POST /api/security/alerts
export const createAlert = async (alertData) => {
  const response = await fetch('/api/security/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertData),
  });
  if (!response.ok) throw new Error('Failed to create alert');
  return await response.json();
};

// GET /api/security/alerts
export const getAlerts = async (filters) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/security/alerts?${query}`);
  if (!response.ok) throw new Error('Failed to fetch alerts');
  return await response.json();
};

// GET /api/security/certificates
export const getCertificates = async (filters) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/security/certificates?${query}`);
  if (!response.ok) throw new Error('Failed to fetch certificates');
  return await response.json();
};

// GET /api/security/firewalls
export const getFirewalls = async (filters) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/security/firewalls?${query}`);
  if (!response.ok) throw new Error('Failed to fetch firewalls');
  return await response.json();
};

// POST /api/security/plans
export const createPlan = async (planData) => {
  const response = await fetch('/api/security/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planData),
  });
  if (!response.ok) throw new Error('Failed to create plan');
  return await response.json();
};

// GET /api/security/plans
export const getPlans = async () => {
  const response = await fetch('/api/security/plans');
  if (!response.ok) throw new Error('Failed to fetch plans');
  return await response.json();
};

// GET /api/security/plans/:id
export const getPlan = async (id) => {
  const response = await fetch(`/api/security/plans/${id}`);
  if (!response.ok) throw new Error('Failed to fetch plan');
  return await response.json();
};

// PUT /api/security/plans/:id
export const updatePlan = async (id, planData) => {
  const response = await fetch(`/api/security/plans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planData),
  });
  if (!response.ok) throw new Error('Failed to update plan');
  return await response.json();
};

// DELETE /api/security/plans/:id
export const deletePlan = async (id) => {
  const response = await fetch(`/api/security/plans/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete plan');
  return await response.json();
};

// GET /api/security/malware
export const getMalware = async () => {
  const response = await fetch('/api/security/malware');
  if (!response.ok) throw new Error('Failed to fetch malware');
  return await response.json();
};

// GET /api/security/login-attempts
export const getLoginAttempts = async () => {
  const response = await fetch('/api/security/login-attempts');
  if (!response.ok) throw new Error('Failed to fetch login attempts');
  return await response.json();
};

// POST /api/security/simulate
export const simulateRequest = async (planId, method, path, ip) => {
  const response = await fetch('/api/security/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, method, path, ip }),
  });
  if (!response.ok) throw new Error('Failed to simulate request');
  return await response.json();
};

// POST /api/security/rules
export const createRule = async (ruleData) => {
  const response = await fetch('/api/security/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ruleData),
  });
  if (!response.ok) throw new Error('Failed to create rule');
  return await response.json();
};

// GET /api/security/rules
export const getRules = async (filters) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/security/rules?${query}`);
  if (!response.ok) throw new Error('Failed to fetch rules');
  return await response.json();
};

// POST /api/security/lists
export const createList = async (listData) => {
  const response = await fetch('/api/security/lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listData),
  });
  if (!response.ok) throw new Error('Failed to create list');
  return await response.json();
};

// PUT /api/security/lists/:id
export const updateList = async (id, listData) => {
  const response = await fetch(`/api/security/lists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listData),
  });
  if (!response.ok) throw new Error('Failed to update list');
  return await response.json();
};

// DELETE /api/security/lists/:id
export const deleteList = async (id) => {
  const response = await fetch(`/api/security/lists/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete list');
  return await response.json();
};

// POST /api/security/rate-limit
export const createRateLimit = async (rateLimitData) => {
  const response = await fetch('/api/security/rate-limit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rateLimitData),
  });
  if (!response.ok) throw new Error('Failed to create rate limit');
  return await response.json();
};

// GET /api/security/rate-limit
export const getRateLimit = async (planId) => {
  const response = await fetch(`/api/security/rate-limit?planId=${planId}`);
  if (!response.ok) throw new Error('Failed to fetch rate limit');
  return await response.json();
};

// POST /api/security/login-policy
export const createLoginPolicy = async (loginPolicyData) => {
  const response = await fetch('/api/security/login-policy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginPolicyData),
  });
  if (!response.ok) throw new Error('Failed to create login policy');
  return await response.json();
};

// GET /api/security/headers
export const getHeaders = async (planId) => {
  const response = await fetch(`/api/security/headers?planId=${planId}`);
  if (!response.ok) throw new Error('Failed to fetch headers');
  return await response.json();
};

// POST /api/security/headers
export const createHeaders = async (headersData) => {
  const response = await fetch('/api/security/headers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(headersData),
  });
  if (!response.ok) throw new Error('Failed to create headers');
  return await response.json();
};

// POST /api/security/scan-plans
export const createScanPlan = async (scanPlanData) => {
  const response = await fetch('/api/security/scan-plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scanPlanData),
  });
  if (!response.ok) throw new Error('Failed to create scan plan');
  return await response.json();
};

// PUT /api/security/scan-plans/:id
export const updateScanPlan = async (id, scanPlanData) => {
  const response = await fetch(`/api/security/scan-plans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scanPlanData),
  });
  if (!response.ok) throw new Error('Failed to update scan plan');
  return await response.json();
};

// DELETE /api/security/scan-plans/:id
export const deleteScanPlan = async (id) => {
  const response = await fetch(`/api/security/scan-plans/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete scan plan');
  return await response.json();
};

// POST /api/security/automations
export const createAutomation = async (automationData) => {
  const response = await fetch('/api/security/automations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(automationData),
  });
  if (!response.ok) throw new Error('Failed to create automation');
  return await response.json();
};

// GET /api/security/automations
export const getAutomations = async (planId) => {
  const response = await fetch(`/api/security/automations?planId=${planId}`);
  if (!response.ok) throw new Error('Failed to fetch automations');
  return await response.json();
};

// PUT /api/security/automations/:id
export const updateAutomation = async (id, automationData) => {
  const response = await fetch(`/api/security/automations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(automationData),
  });
  if (!response.ok) throw new Error('Failed to update automation');
  return await response.json();
};

// DELETE /api/security/automations/:id
export const deleteAutomation = async (id) => {
  const response = await fetch(`/api/security/automations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete automation');
  return await response.json();
};

// GET /api/security/audit-logs
export const getAuditLogs = async (filters) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/security/audit-logs?${query}`);
  if (!response.ok) throw new Error('Failed to fetch audit logs');
  return await response.json();
};
