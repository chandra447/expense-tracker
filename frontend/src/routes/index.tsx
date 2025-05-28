import { createFileRoute } from '@tanstack/react-router'



import {api} from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

// function to fetch the data from the backend hono
async function getTotalSpent(){
  await new Promise(resolve => setTimeout(resolve, 2000));
  const result = await api.expenses['total-spent'].$get();
  if (!result.ok){
    throw new Error('server error')
  }
  return result.json();
}

//Create the file route and assign the component
export const Route = createFileRoute('/')({
    component: Index,
  })


function Index() {
  const {isPending, error, data} = useQuery({queryKey:['get-total-spent'], queryFn:getTotalSpent })
  
  if (error) return 'An error has occured: '+error.message;

  return (
    <>
     <Card className='w-[350px] m-auto'>
       <CardHeader>
         <CardTitle>Total Spent 💰</CardTitle>
         <CardDescription>The total amount of you've spent</CardDescription>
       </CardHeader>
       <CardContent>
         {isPending ? (
           <Skeleton className="h-12 w-12 rounded-full mx-auto" />
         ) : (
           <h2 className="text-2xl text-center mb-4">${data?.total}</h2>
         )}
       </CardContent>
     </Card>
    </>
  )
}


