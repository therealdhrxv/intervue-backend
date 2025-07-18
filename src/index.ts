import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import sessionRouter from "./routes/session";
import pollsRouter from "./routes/polls";
import responsesRouter from "./routes/responses";
import studentsRouter from "./routes/students";
import chatRouter from "./routes/chat";
import { createServer } from "http";
import { setupSocket } from "./socket";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/health_check", (req, res) => {
  res.json({ message: "OK" });
});
app.use("/api/session", sessionRouter);
app.use("/api/polls", pollsRouter);
app.use("/api/polls", responsesRouter); // responses are nested under /api/polls/:id/responses
app.use("/api/students", studentsRouter);
app.use("/api/chat", chatRouter);

const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);
setupSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});
