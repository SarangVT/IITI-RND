import express from "express"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import prisma from "../db/prisma.js"
import { client as clientLink, server} from "../lib/client.js"

const router = express.Router()

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const redirectUri = `${server}/api/auth/admin/google/callback`

router.get("/verify", (req, res) => {
  const token = req.cookies.acKey
  if (!token) return res.status(401).json({ success: false, message: "No token" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.json({ success: true, admin: decoded })
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid token" })
  }
})

router.get("/google/redirect", (req, res) => {
  const scope = ["openid", "email", "profile"].join(" ")
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&prompt=select_account`
  res.redirect(url)
})

router.get("/google/callback", async (req, res) => {
  const code = req.query.code
  if (!code) return res.status(400).send("No code provided")

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  })
  const tokens = await tokenRes.json()
  const idToken = tokens.id_token

  const oAuth2Client = new OAuth2Client(clientId)
  const ticket = await oAuth2Client.verifyIdToken({
    idToken,
    audience: clientId
  })
  const payload = ticket.getPayload()
  const email = payload.email

  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) return res.status(403).send("You are not an admin")

  const jwtToken = jwt.sign({ id: admin.id, email: admin.email, name: admin.name }, process.env.JWT_SECRET, { expiresIn: "7d" })
  const isProd = process.env.NODE_ENV === "PROD";
  res.cookie("acKey", jwtToken, {
    httpOnly: true,
    secure: isProd,     
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.redirect(`${clientLink}/admin/panel`)
})

router.post("/create", async (req, res) => {
  try {
    const { name, email, secret } = req.body

    if (!name || !email || !secret) {
      return res.status(400).json({ success: false, message: "name, email & secret required" })
    }

    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: "Invalid secret key" })
    }

    const existing = await prisma.admin.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ success: false, message: "Admin already exists" })
    }

    const admin = await prisma.admin.create({
      data: { name, email }
    })

    return res.json({ success: true, admin })
  } catch (err) {
    console.error("Admin creation error:", err)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

export default router