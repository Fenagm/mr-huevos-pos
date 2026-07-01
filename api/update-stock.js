import { handler } from '../netlify/functions/update-stock.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
