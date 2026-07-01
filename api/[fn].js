import { toVercelHandler } from '../lib/netlify-adapter.js'

// Single catch-all serverless function that dispatches to the matching
// Netlify-style handler in `netlify/functions/`. This keeps us under the
// Hobby plan's 12-function limit by using ONE function instead of one per route.

// Allow-list of valid function names (mirrors files in netlify/functions/).
const FUNCTIONS = new Set([
  'add-account-movement',
  'add-expense',
  'assign-delivery',
  'close-session',
  'create-delivery',
  'create-sale',
  'delete-product',
  'get-customer-movements',
  'get-customers-accounts',
  'get-deliveries',
  'get-expenses',
  'get-products',
  'get-reports',
  'get-sessions',
  'get-spoilages',
  'get-vehicles',
  'login',
  'logout',
  'open-session',
  'record-account-payment',
  'record-sale',
  'register-spoilage',
  'save-product',
  'toggle-customer-active',
  'unassign-delivery',
  'update-credit-limit',
  'update-delivery-status',
  'update-route-order',
  'update-stock',
])

export default async function handler(req, res) {
  const fn = req.query.fn

  if (!fn || !FUNCTIONS.has(fn)) {
    res.status(404).json({ success: false, error: `Unknown function: ${fn}` })
    return
  }

  try {
    const mod = await import(`../netlify/functions/${fn}.js`)
    const netlifyHandler = mod.handler || mod.default
    if (typeof netlifyHandler !== 'function') {
      res.status(500).json({ success: false, error: `No handler exported by ${fn}` })
      return
    }
    return toVercelHandler(netlifyHandler)(req, res)
  } catch (err) {
    console.error('[v0] catch-all api error:', err)
    res.status(500).json({ success: false, error: err?.message || 'Internal Server Error' })
  }
}
