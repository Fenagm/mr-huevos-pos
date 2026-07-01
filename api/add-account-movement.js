import { handler } from '../netlify/functions/add-account-movement.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
