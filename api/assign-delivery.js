import { handler } from '../netlify/functions/assign-delivery.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
