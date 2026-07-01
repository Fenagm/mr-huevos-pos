import { handler } from '../netlify/functions/register-spoilage.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
