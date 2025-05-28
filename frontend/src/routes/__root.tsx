import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { BadgeDollarSign } from "lucide-react";
export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar />

      <Outlet />
      <Toaster />
      <TanStackRouterDevtools />
    </>
  ),
});

function Navbar() {
  const linkClass = "[&.active]:font-bold [&.active]:text-primary hover:-translate-y-1 transition-all duration-300 ease-in-out relative before:content-[''] before:absolute before:w-0 before:h-0.5 before:-bottom-1 before:left-1/2 before:bg-primary before:transition-all before:duration-300 hover:before:w-full hover:before:left-0";
  

  return (
    <>
      <nav className="mx-auto max-w-lg p-5 rounded-md border mt-2 border-primary justify-items-center mb-2 ">
        <div className="flex flex-row items-center space-x-3">
          <BadgeDollarSign className="shadow shadow-secondary h-5 w-5"/>
          
          <Link to="/" className={linkClass}>
            Home
          </Link>

          <Link to="/expenses" className={linkClass}>
            Expenses
          </Link>
          <Link to="/create-expense" className={linkClass}>
            Create
          </Link>
          <Link to="/about" className={linkClass}>
            About
          </Link>
        </div>
      </nav>
    </>
  );
}
