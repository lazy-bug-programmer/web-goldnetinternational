"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { loginWithEmailAndPassword } from "@/lib/firebase/client";
import { createSessionCookie } from "@/lib/actions/auth.action";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      console.log("Starting login process...");

      // Sign in with Firebase Authentication
      const userCredential = await loginWithEmailAndPassword(
        values.email,
        values.password
      );

      console.log("Firebase login successful, getting ID token...");

      // Get the ID token
      const idToken = await userCredential.user.getIdToken();

      console.log("ID token obtained, creating session cookie...");

      // Create a session cookie on the server
      const result = await createSessionCookie(idToken);

      console.log("Session cookie result:", result);

      if (result.success) {
        // Show success message
        toast.success("Successfully signed in!");

        // Redirect to home page or dashboard
        router.push("/");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to create session");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Show error message
      let errorMessage = "Failed to sign in";
      if (error instanceof Error) {
        // Extract specific Firebase auth errors
        if (
          error.message.includes("auth/user-not-found") ||
          error.message.includes("auth/wrong-password") ||
          error.message.includes("auth/invalid-credential")
        ) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes("auth/too-many-requests")) {
          errorMessage =
            "Too many failed login attempts. Please try again later.";
        } else if (error.message.includes("auth/network-request-failed")) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-300">
            <div className="text-center space-y-6 mb-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome Back
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Sign in to your Gold Net International account
                </p>
              </div>
            </div>

            {/* Login Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 transition-colors duration-300"
                          {...field}
                        />
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 pr-12 transition-colors duration-300"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium transition-colors duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  Create an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
