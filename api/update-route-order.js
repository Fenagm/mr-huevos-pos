import { handler } from '../netlify/functions/update-route-order.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
