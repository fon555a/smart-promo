import express from "express"
import { getToken } from "../controllers/assemblyaiController"
const router = express.Router()

router.post("/assembly-token",  getToken)



export default router