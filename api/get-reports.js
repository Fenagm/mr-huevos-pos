import { handler } from '../netlify/functions/get-reports.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
