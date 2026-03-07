import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from 'express';
import { db } from "./database";



const validateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(400).send({ error: "Token not found" });
        }

        const token = authorization.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env['SECRET']!);
        if (!decodedToken) {
            console.log("Token invalid!");
            return res.status(401).json({ error: 'token invalid' });
        }

        // Attach the decoded token to the request for later use if needed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).decodedToken = decodedToken;
        next(); // Proceed to the next middleware or route handler
    } catch (e) {
        console.log(e);
        return res.status(401).json({ error: 'token invalid' });
    }
};

const requireAdminIfExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admins = await db`SELECT EXISTS (SELECT 1 FROM admin);`;
        const adminExists: boolean = admins[0].exists;

        if (!adminExists) {
            return next();
        }

        return validateToken(req, res, next);

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to check admin existence" });
    }
};

export { validateToken, requireAdminIfExists };