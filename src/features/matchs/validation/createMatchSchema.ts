import { z } from "zod";


const createMatchSchema = z
  .object({
    homeTeam: z.string().min(2, "Home Team name should be required"),
    awayTeam: z.string().min(2, "Away Team name should be required"),
    sport: z.string().min(2, "Sport name should be required"),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    homeScore: z.coerce
      .number()
      .int("Home score must be an integer")
      .nonnegative("Home score must be a non-negative number")
      .optional(),
    awayScore: z.coerce
      .number()
      .int("Away score must be an integer")
      .nonnegative("Away score must be a non-negative number")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const now = new Date();

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }

    
    if (start > now) {
      if (data.homeScore !== undefined && data.homeScore > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Cannot add goals for a scheduled match that hasn't started yet",
          path: ["homeScore"],
        });
      }
      if (data.awayScore !== undefined && data.awayScore > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Cannot add goals for a scheduled match that hasn't started yet",
          path: ["awayScore"],
        });
      }
    }

    if (end < now) {
      if (data.homeScore === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Home score is required for a completed match",
          path: ["homeScore"],
        });
      }
      if (data.awayScore === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Away score is required for a completed match",
          path: ["awayScore"],
        });
      }
    }
  });

export { createMatchSchema };
