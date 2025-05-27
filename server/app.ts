import { Hono } from "hono";
import { logger } from "hono/logger";
import { expensesRoute } from "./routes/expenses";
import { serveStatic } from "hono/bun";

const app = new Hono()
app.use(logger())

app.get('/test',c=>{
    return c.json({"message":"test"})
})

app.route("/api/expenses",expensesRoute)

app.get('*',serveStatic({root: './frontend/dist'}));
app.get('*',serveStatic({root: './frontend/dist/index.html'}));


export default app;



