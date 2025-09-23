import express from 'express';
import { getSecurityPlans, createSecurityPlan, getSecurityPlanById, updateSecurityPlan, deleteSecurityPlan } from '../controllers/securityPlanController.js';
import { getSecurityRules, createSecurityRule, updateSecurityRule, deleteSecurityRule } from '../controllers/securityRuleController.js';

const router = express.Router();

// Security Plan Routes
router.route('/').get(getSecurityPlans).post(createSecurityPlan);
router.route('/:id').get(getSecurityPlanById).put(updateSecurityPlan).delete(deleteSecurityPlan);

// Security Rule Routes
router.route('/:planId/rules').get(getSecurityRules).post(createSecurityRule);
router.route('/:planId/rules/:ruleId').put(updateSecurityRule).delete(deleteSecurityRule);

export default router;
