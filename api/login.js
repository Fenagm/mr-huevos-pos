import { handler } from '../netlify/functions/login.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
