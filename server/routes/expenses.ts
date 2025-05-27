import { Hono } from "hono";
import {z} from "zod";
import { zValidator } from "@hono/zod-validator";


const expenseSchema = z.object({
    id: z.number().int().positive().min(1),
    title: z.string().min(3),
    amount: z.number().gt(0)
});

const createPostSchema = expenseSchema.omit({id: true});

type Expense = z.infer<typeof expenseSchema>;

let fakeExpenses: Expense[] = [
    { id: 1, title: "Groceries", amount: 75.50 },
    { id: 2, title: "Dinner at Restaurant", amount: 45.25 },
    { id: 3, title: "Gas", amount: 40.00 },
    { id: 4, title: "Movie Tickets", amount: 24.50 },
    { id: 5, title: "Online Subscription", amount: 12.99 }
]

export const expensesRoute = new Hono()
.get('/',async (c)=>{
    return c.json({expenses: fakeExpenses})
})

.post("/",zValidator("json",createPostSchema),async (c)=>{
    const data = await c.req.valid("json");
    fakeExpenses.push({...data,id: fakeExpenses.length+1});
    c.status(201);
    return c.json(data);
})
.get("/total-spent",(c)=>{
    let total = fakeExpenses.reduce((total, expense) => total + expense.amount, 0);
    return c.json({ total });
})

.get("/:id{[0-9+]}",async (c)=>{
    const id = await Number.parseInt(c.req.param("id"));
    let expense = fakeExpenses.find(expense=> expense.id===id);
    if (!expense){
        return c.notFound()
    }
    return c.json({expense});
})
.delete("/:id{[0-9+]}",async (c)=>{
    const id = await Number.parseInt(c.req.param("id"));
    let expense = fakeExpenses.find(expense=> expense.id===id);
    if (!expense){
        return c.notFound()
    }
    fakeExpenses = fakeExpenses.filter(expense=> expense.id!==id);
    return c.json({expense});
})

