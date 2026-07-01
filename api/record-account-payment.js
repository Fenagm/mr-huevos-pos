import { handler } from '../netlify/functions/record-account-payment.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
