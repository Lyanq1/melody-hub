import express from 'express'
import { placeholder } from '../controllers/admin.controller.js'

const router = express.Router()

router.get('/', placeholder)

export default router
