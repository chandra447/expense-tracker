import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

function FieldInfo({ field }: { field: AnyFieldApi }) {
    return (
      <>
        {field.state.meta.isTouched && !field.state.meta.isValid ? (
          <em className="text-red-500 text-sm">{field.state.meta.errors.join(', ')}</em>
        ) : null}
        {field.state.meta.isValidating ? <em className="text-blue-500 text-sm">Validating...</em> : null}
      </>
    )
}

function CreateExpense() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm({
        defaultValues: {
            title: '',
            amount: '',
        },
        onSubmit: async ({ value }) => {
            await new Promise(resolve=>setTimeout(resolve,1000));
            try {
                const response = await api.expenses.$post({
                    json: {
                        title: value.title,
                        amount: Number(value.amount)
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to create expense');
                }

                // Invalidate and refetch expenses
                await queryClient.invalidateQueries({ queryKey: ['get-expenses'] });
                await queryClient.invalidateQueries({ queryKey: ['get-total-spent'] });
                
                // Reset form to default values
                form.reset();
                
                toast.success(`Expense ${value.title } added successfully `,{
                    description:`Amount : ${value.amount}`,
                    action: {
                        label: "Dismiss",
                        onClick: () => console.log("Warning toast dismissed!"),
                      },
                      duration: 3000,
                })

                await new Promise(resolve=>setTimeout(resolve,1000));
                navigate({to:'/expenses'});

            } catch (error) {
                console.error('Error creating expense:', error);
            }
        }
    });

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Create New Expense</h2>
            <form 
                className='max-w-md mx-auto flex flex-col gap-4 border border-secondary mt-2 p-6 rounded-md shadow-lg'
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}
            >
                <form.Field
                    name="title"
                    validators={{
                        onChange: ({ value }) =>
                            !value ? 'Title is required' :
                            value.length < 3 ? 'Title must be at least 3 characters' :
                            undefined,
                    }}
                    children={(field) => (
                        <>
                            <Label htmlFor={field.name}>Title</Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Enter expense title"
                            />
                            <FieldInfo field={field} />
                        </>
                    )}
                />
                
                <form.Field
                    name="amount"
                    validators={{
                        onChangeAsyncDebounceMs: 500,
                        onChange: ({ value }) =>
                            !value ? 'Amount is required' :
                            isNaN(Number(value)) ? 'Amount must be a number' :
                            Number(value) <= 0 ? 'Amount must be greater than 0' :
                            undefined,
                    }}
                    children={(field) => (
                        <>
                            <Label htmlFor={field.name}>Amount</Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                type="number"
                                step="0.01"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="0.00"
                            />
                            <FieldInfo field={field} />
                        </>
                    )}
                />
                
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button type="submit" disabled={!canSubmit || isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Expense'}
                        </Button>
                    )}
                />
            </form>
        </div>
    );
}

export const Route = createFileRoute('/create-expense')({
  component: CreateExpense,
})
