"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const FORM_FIELDS: Array<{
  name: keyof LoginFormData;
  label: string;
  placeholder: string;
  type: string;
  showPasswordToggle?: boolean;
}> = [
  { name: "email", label: "RUET Email", placeholder: "xxxxxxx@student.ruet.ac.bd", type: "email" },
  { name: "password", label: "Password", placeholder: "Enter your password", type: "password", showPasswordToggle: true },
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const googleError = searchParams.get("error");

  useEffect(() => {
    if (googleError === "invalid_ruet_email") {
      toast.error("Please sign in with your RUET student email (@student.ruet.ac.bd)");
    }
  }, [googleError]);

  useEffect(() => {
    if (session?.user) {
      const isRUETEmail = (session.user as unknown as { isRUETEmail?: boolean }).isRUETEmail;
      
      if (isRUETEmail === false) {
        toast.error("Please sign in with your RUET student email (@student.ruet.ac.bd)");
        signOut({ callbackUrl: "/login" });
        return;
      }

      if (!session.user.onboardingCompleted) {
        router.push("/register");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, router]);

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        type: "email",
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/login" });
  };

  const renderFormField = (field: typeof FORM_FIELDS[0]) => {
    const error = errors[field.name];
    const isTouched = touchedFields[field.name];
    const showError = isTouched && error;

    return (
      <div key={field.name} className="space-y-2">
        {field.name === "password" && (
          <div className="flex items-center justify-between">
            <Label htmlFor={field.name}>{field.label}</Label>
            <a href="/forgot-password" className="text-xs text-slate-500 hover:text-blue-600">
              Forgot password?
            </a>
          </div>
        )}
        {!field.showPasswordToggle && <Label htmlFor={field.name}>{field.label}</Label>}
        <div className="relative">
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              <Input
                {...controllerField}
                id={field.name}
                type={field.showPasswordToggle && showPassword ? "text" : field.type}
                placeholder={field.placeholder}
                disabled={isLoading}
                className={showError ? "border-red-500 focus:border-red-500" : ""}
              />
            )}
          />
          {field.showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {showError && (
          <p className="text-xs text-red-500 mt-1">{error.message as string}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
      <Toaster position="top-center" />
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in with your RUET student account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Manual Signin</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
            {Object.entries(FORM_FIELDS).map(([_, field]) => renderFormField(field))}

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline font-medium">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}