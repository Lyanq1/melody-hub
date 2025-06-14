import express from 'express'
import { getAllArtists } from '../controllers/artist.controller.js'

const router = express.Router()

router.get('/', getAllArtists)

export default router
