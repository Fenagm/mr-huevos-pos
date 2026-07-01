import { handler } from '../netlify/functions/create-sale.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
