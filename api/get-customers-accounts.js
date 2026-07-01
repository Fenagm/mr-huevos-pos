import { handler } from '../netlify/functions/get-customers-accounts.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
