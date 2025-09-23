// controllers/securityRuleController.js
import asyncHandler from "express-async-handler";
import SecurityRule from "../models/SecurityRule.js";
import SecurityPlan from "../models/SecurityPlan.js";

// Get all rules for a specific plan
export const getSecurityRules = asyncHandler(async (req, res) => {
  const rules = await SecurityRule.find({ planId: req.params.planId });
  res.json(rules);
});

// Create a new security rule for a specific plan
export const createSecurityRule = asyncHandler(async (req, res) => {
  const {
    planId,
    type,
    protocol,
    portRange,
    source,
    destination,
    description,
    status,
    priority,
  } = req.body;
  if (
    !planId ||
    !type ||
    !protocol ||
    !portRange ||
    (!source && !destination)
  ) {
    res.status(400);
    throw new Error(
      "planId, type, protocol, portRange, and source or destination are required"
    );
  }
  const rule = new SecurityRule({
    planId,
    type,
    protocol,
    portRange,
    source,
    destination,
    description,
    status,
    priority,
  });
  await rule.save();

  // Update ruleCount in the associated plan
  const plan = await SecurityPlan.findById(planId);
  if (plan) {
    const newRuleCount = await SecurityRule.countDocuments({ planId });
    if (plan.ruleCount !== newRuleCount) {
      plan.ruleCount = newRuleCount;
      await plan.save();
    }
  }

  res.status(201).json(rule);
});

// Update a specific rule by ID
export const updateSecurityRule = asyncHandler(async (req, res) => {
  const rule = await SecurityRule.findById(req.params.ruleId);

  if (!rule) {
    res.status(404);
    throw new Error("Security rule not found");
  }

  rule.type = req.body.type || rule.type;
  rule.protocol = req.body.protocol || rule.protocol;
  rule.portRange = req.body.portRange || rule.portRange;
  rule.source = req.body.source || rule.source;
  rule.destination = req.body.destination || rule.destination;
  rule.description = req.body.description || rule.description;
  rule.status = req.body.status || rule.status;
  rule.priority = req.body.priority || rule.priority;

  const updatedRule = await rule.save();

  // Update ruleCount in the associated plan
  const plan = await SecurityPlan.findById(rule.planId);
  if (plan) {
    const newRuleCount = await SecurityRule.countDocuments({
      planId: rule.planId,
    });
    if (plan.ruleCount !== newRuleCount) {
      plan.ruleCount = newRuleCount;
      await plan.save();
    }
  }

  res.json(updatedRule);
});

// Delete a specific rule by ID
export const deleteSecurityRule = asyncHandler(async (req, res) => {
  const rule = await SecurityRule.findById(req.params.ruleId);

  if (!rule) {
    res.status(404);
    throw new Error("Security rule not found");
  }

  const planId = rule.planId;
  await rule.deleteOne();

  // Update ruleCount in the associated plan
  const plan = await SecurityPlan.findById(planId);
  if (plan) {
    const newRuleCount = await SecurityRule.countDocuments({ planId });
    if (plan.ruleCount !== newRuleCount) {
      plan.ruleCount = newRuleCount;
      await plan.save();
    }
  }

  res.json({ message: "Security rule removed" });
});
