import { handler } from '../netlify/functions/get-spoilages.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
