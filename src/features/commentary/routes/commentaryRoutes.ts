import { Router } from "express";
import { createCommentary, getCommentaryByMatchId } from "../controllers/commentaryController";
import { validateRequest } from "../../../middleware/validateRequest";
import { createCommentarySchema } from "../validation/createCommentarySchema";

export const commentaryRouter = Router();

commentaryRouter.get("/:id", getCommentaryByMatchId);

commentaryRouter.post('/:id',validateRequest(createCommentarySchema) ,createCommentary)