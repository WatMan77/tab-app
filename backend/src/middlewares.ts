import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from 'express';


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
        (req as any).decodedToken = decodedToken;
        next(); // Proceed to the next middleware or route handler
    } catch (e) {
        console.log(e);
        return res.status(401).json({ error: 'token invalid' });
    }
};

export { validateToken }