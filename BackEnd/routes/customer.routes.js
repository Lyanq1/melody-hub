import express from 'express'
import { placeholder } from '../controllers/customer.controller.js'

const router = express.Router()

router.get('/placeholder', placeholder)

export default router
