import { asyncHandler } from '../lib/asyncHandler.js';
import SecurityPlan from '../models/SecurityPlan.js';

// Super simple example: if any inbound rule description contains "deny" or
// the path matches a deny rule's pattern, return BLOCK, else ALLOW.
export const simulateRequest = asyncHandler(async (req, res) => {
  const { planId, method = 'GET', path = '/', ip = '' } = req.body || {};
  const plan = await SecurityPlan.findById(planId);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });

  // naive rule match — customize to your schema
  const denyRule =
    (plan.inboundRules || []).find(r =>
      String(r.description || '').toLowerCase().includes('deny') ||
      String(r.portRange || '').toLowerCase().includes('deny') ||
      String(r.source || '').toLowerCase().includes('blocked') ||
      (r.type === 'Path' && path.includes(r.source || ''))
    );

  const decision = denyRule ? 'BLOCK' : 'ALLOW';
  res.json({
    decision,
    matchedRule: denyRule || null,
    inputs: { method, path, ip, planId },
    reason: denyRule ? 'Matched deny-like rule heuristic' : 'No deny rule matched',
  });
});
