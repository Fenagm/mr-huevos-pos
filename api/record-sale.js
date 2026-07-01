import { handler } from '../netlify/functions/record-sale.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
