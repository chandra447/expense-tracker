import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Skeleton } from '@/components/ui/skeleton'

async function getExpenses(){
    const res = await api.expenses.$get()
    if (!res.ok){
        throw new Error('A server error accoured fetching expenses')
    }
    const data = res.json();
    return data;
}

function LoadingTableRows(){
    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                    <TableCell>
                        <Skeleton className="h-4 " />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 " />
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}

function RouteComponent() {
    const {isLoading, data, error} = useQuery({queryKey:['get-expenses'],queryFn:getExpenses});
    
    if (error) return <div>Error: {error.message}</div>;

    return <div>
        <Table className='shadow-2xl mx-auto max-w-md mt-2 rounded-xl border  border-secondary'>
            <TableCaption>List of all expenses</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className='w-[100px]'>Expense</TableHead>
                    <TableHead>Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <LoadingTableRows />
                ) : (
                    data?.expenses.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell className='font-medium'>{expense.title}</TableCell>
                            <TableCell>${expense.amount}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell>Total expenses</TableCell>
                    <TableCell>
                        {isLoading ? (
                            <Skeleton className="h-4 w-[60px]" />
                        ) : (
                            `$${data?.expenses.reduce((total, expense) => total + expense.amount, 0)}`
                        )}
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    </div>
}

export const Route = createFileRoute('/expenses')({
  component: RouteComponent,
})
