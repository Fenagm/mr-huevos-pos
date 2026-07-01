import { handler } from '../netlify/functions/unassign-delivery.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
