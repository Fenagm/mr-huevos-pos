import { handler } from '../netlify/functions/get-customer-movements.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
