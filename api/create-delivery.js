import { handler } from '../netlify/functions/create-delivery.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
