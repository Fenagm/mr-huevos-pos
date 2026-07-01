import { handler } from '../netlify/functions/toggle-customer-active.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
