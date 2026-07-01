import { handler } from '../netlify/functions/get-deliveries.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
