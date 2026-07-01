import { handler } from '../netlify/functions/get-expenses.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
