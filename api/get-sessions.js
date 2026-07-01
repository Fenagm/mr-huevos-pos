import { handler } from '../netlify/functions/get-sessions.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
