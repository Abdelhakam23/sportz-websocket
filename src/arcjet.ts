import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";
import { Request, Response, NextFunction } from "express";

const arcjetKey = process.env.ARCJET_KEY;

const aj = arcjet({
  key: arcjetKey!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 10,
      interval: 10,
      capacity: 15,
    }),
  ],
});

export const websocketMiddleware = arcjet({
      key: arcjetKey!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 10,
      interval: 10,
      capacity: 15,
    }),
  ],
})

export const securityMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!aj) {
      return res.status(500).json({ error: "Arcjet is not initialized" });
    }
    try {
      const decision = await aj.protect(req, { requested: 1 });
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: "Too Many Requests" });
        } else if (decision.reason.isBot()) {
          return res.status(403).json({ error: "No Bots Allowed" });
        } else {
          return res.status(403).json({ error: "Forbidden" });
        }
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    next();
  };
};
