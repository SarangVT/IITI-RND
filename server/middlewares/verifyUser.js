import jwt from "jsonwebtoken"

export default (req, res, next) => {
  const token =
    req.cookies?.acKey || req.headers.authorization?.split(" ")[1]

  if (!token) return res.status(401).json({ error: "Unauthorized" })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    // console.log("verified user: ", decoded)
    next()
  } catch {
    res.status(401).json({ error: "Invalid token" })
  }
}