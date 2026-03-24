import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import api from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().optional(),
  contact: z
    .string()
    .min(10, { message: "Contact number must be at least 10 digits." }),
  wing: z.string().min(1, { message: "Wing is required." }),
  flatNumber: z.string().min(1, { message: "Flat number is required." }),
});

export function AddResidentModal({
  onResidentAdded,
}: {
  onResidentAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      contact: "",
      wing: "",
      flatNumber: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setGeneratedPassword(null);
    setIsLoading(true);
    try {
      const response = await api.post("/residents", values);
      if (response.status !== 201) {
        throw new Error(response.data.message || "Failed to add resident"); // Axios throws on error usually, but status check here
      }

      toast({
        title: "Success",
        description: "Resident added successfully",
      });

      if (response.data.data?.tempPassword) {
        setGeneratedPassword(response.data.data.tempPassword);
        // Don't close modal immediately so they can see the password
        form.reset();
        onResidentAdded?.();
      } else {
        form.reset();
        setOpen(false);
        onResidentAdded?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-gradient-warm text-primary-foreground shadow-button btn-press">
          <Plus className="w-4 h-4 mr-2" />
          Add Resident
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Resident</DialogTitle>
          <DialogDescription>
            Enter the details of the new resident here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter resident's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter resident's email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      (Leave empty to auto-generate)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="+91" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="wing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wing</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flatNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flat</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Resident
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {generatedPassword && (
          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
              Resident Created Successfully!
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Share this temporary password with the resident:
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="px-3 py-1.5 rounded bg-background border font-mono text-lg select-all">
                {generatedPassword}
              </code>
            </div>
            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={() => {
                setOpen(false);
                setGeneratedPassword(null);
              }}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
