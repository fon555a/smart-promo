import type { Request, Response } from "express"

import express from "express"

const router = express.Router()

router.post("/update-distance", (request: Request, response: Response) => {
    const distance = request.body

    console.log("Updated distance:", distance)
})

export default router