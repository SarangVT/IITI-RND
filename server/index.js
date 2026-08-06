import 'dotenv/config';

import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import allRoutes from "./routes/index.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)

// // Debug logger: logs every request, raw cookie header and parsed cookies
// app.use((req, res, next) => {
//     console.log("[REQ]", req.method, req.originalUrl)
//     console.log("  headers.cookie:", req.headers.cookie)
//     console.log("  req.cookies:", req.cookies)
//     next()
// })

app.use("/api", allRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))