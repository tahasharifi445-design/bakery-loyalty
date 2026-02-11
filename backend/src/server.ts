import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.routes";
import { customerRouter } from "./routes/customer.routes";
import { requireAuth } from "./middleware/auth.middleware";
import { connectDb } from "./db";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "james-bakery-loyalty-api" });
});

app.use("/v1/auth", authRouter);
app.use("/v1/customers", requireAuth, customerRouter);

const port = Number(process.env.PORT ?? 4000);

const startServer = async (): Promise<void> => {
  try {
    await connectDb();
    app.listen(port, () =>
      console.log(`API running on http://localhost:${port}`)
    );
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

void startServer();

