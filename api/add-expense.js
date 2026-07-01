import { handler } from '../netlify/functions/add-expense.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
