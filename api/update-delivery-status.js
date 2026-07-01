import { handler } from '../netlify/functions/update-delivery-status.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
