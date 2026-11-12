import { Request, Response } from "express";
import { prisma } from "../../../config/db.ts";
import { broadcastCommentAdded } from "../../../websocket/index.ts";

const createCommentary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ...details } = req.body;
    const lastCommentary = await prisma.commentary.findFirst({
      where: {
        matchId: id as string,
        minute: details.minute,
      },
      orderBy: {
        sequence: "desc",
      },
    });

    const nextSequence = lastCommentary ? lastCommentary.sequence + 1 : 1;

    const newCommentary = await prisma.commentary.create({
      data: {
        matchId: id,
        sequence: nextSequence,
        ...details,
      },
    });

    broadcastCommentAdded(id as string , newCommentary);

    return res
      .status(201)
      .json({
        message: "Commentary created successfully",
        data: newCommentary,
      });
  } catch (error) {
    console.error("Error creating commentary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCommentaryByMatchId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const commentaries = await prisma.commentary.findMany({
      where: {
        matchId: id as string,
      },
      orderBy: [{ minute: "asc" }, { sequence: "asc" }],
    });
    if (commentaries.length === 0) {
      return res
        .status(404)
        .json({ message: "No commentary found for this match" });
    }

    return res
      .status(200)
      .json({
        message: "Commentary retrieved successfully",
        data: commentaries,
      });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createCommentary, getCommentaryByMatchId };
