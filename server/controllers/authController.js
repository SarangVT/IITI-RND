import express from "express"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import prisma from "../db/prisma.js"
import { client as clientUrl, server } from "../lib/client.js"

const router = express.Router()
const redirectUri = `${server}/api/auth/google/callback`
const isProd = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "PROD"

router.get("/verify", (req, res) => {
  const token = req.cookies.acKey
  if (!token) return res.status(401).json({ success: false, message: "No token" })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.json({ success: true, user: decoded })
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
  try {
    const code = req.query.code
    if (!code) return res.status(400).send("No code provided")

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    })
    const tokens = await tokenRes.json()
    const idToken = tokens.id_token

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()
    const email = payload.email

    if (!email.endsWith("@iiti.ac.in")) return res.status(403).send("Use institute email only")

    const now = new Date()
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: payload.name || "Unnamed", lastVisit: now },
      create: { email, name: payload.name || "Unnamed", lastVisit: now }
    })

    const jwtToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("acKey", jwtToken, {
      httpOnly: true,
      secure: isProd,     
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/" // MUST match clearCookie path
    })
    res.redirect(`${clientUrl}/dashboard`)
  } catch (err) {
    console.error("OAuth callback error:", err)
    res.status(500).send("Auth failed")
  }
})

router.post("/logout", (req, res) => {
  res.clearCookie("acKey", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  })
  return res.json({ success: true, message: "Logged out successfully" })
})

export default router