// controllers/securityPlanController.js
import asyncHandler from 'express-async-handler';
import SecurityPlan from '../models/SecurityPlan.js';
import SecurityRule from '../models/SecurityRule.js';

// Get all security plans
export const getSecurityPlans = asyncHandler(async (req, res) => {
  const plans = await SecurityPlan.find();
  // Calculate ruleCount for each plan
  const plansWithRuleCount = await Promise.all(plans.map(async (plan) => {
  const rules = await SecurityRule.find({ planId: plan._id });
  const ruleCount = rules.length;
  const denyRules = rules.filter(rule => rule.type === 'deny').length; // Example filter for deny rules
  const recentlyModified = rules.filter(rule => 
    new Date(rule.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length; // Last 24 hours
  return { ...plan.toObject(), ruleCount, denyRules, recentlyModified };
}));
  res.json(plansWithRuleCount);
});

// Create a new security plan
export const createSecurityPlan = asyncHandler(async (req, res) => {
  const { name, description, owner, mode, targets } = req.body;
  const plan = new SecurityPlan({ name, description, owner, mode, targets });
  const createdPlan = await plan.save();
  res.status(201).json(createdPlan);
});

// Get a specific security plan by ID
export const getSecurityPlanById = asyncHandler(async (req, res) => {
  const plan = await SecurityPlan.findById(req.params.id);

  if (!plan) {
    res.status(404);
    throw new Error('Security plan not found');
  }

  const ruleCount = await SecurityRule.countDocuments({ planId: plan._id });
  res.json({ ...plan.toObject(), ruleCount });
});

// Update a security plan by ID
export const updateSecurityPlan = asyncHandler(async (req, res) => {
  const plan = await SecurityPlan.findById(req.params.id);

  if (!plan) {
    res.status(404);
    throw new Error('Security plan not found');
  }

  plan.name = req.body.name || plan.name;
  plan.description = req.body.description || plan.description;
  plan.owner = req.body.owner || plan.owner;
  plan.mode = req.body.mode || plan.mode;
  plan.targets = req.body.targets || plan.targets;

  const updatedPlan = await plan.save();
  const ruleCount = await SecurityRule.countDocuments({ planId: updatedPlan._id });
  res.json({ ...updatedPlan.toObject(), ruleCount });
});

// Delete a security plan
export const deleteSecurityPlan = asyncHandler(async (req, res) => {
  const plan = await SecurityPlan.findById(req.params.id);

  if (!plan) {
    res.status(404);
    throw new Error('Security plan not found');
  }

  await SecurityRule.deleteMany({ planId: plan._id }); // Remove associated rules
  await plan.deleteOne();
  res.json({ message: 'Security plan removed' });
});