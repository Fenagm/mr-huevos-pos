import { handler } from '../netlify/functions/update-credit-limit.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
