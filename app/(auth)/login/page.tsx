"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser, setLoading } from "@/store/slices/authSlice";
import Link from "next/link";

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
  const dispatch = useAppDispatch();
  const { isLoading: isAuthLoading } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const googleError = searchParams.get("error");

  useEffect(() => {
    if (googleError === "invalid_ruet_email") {
      toast.error("Please sign in with your RUET student email (@student.ruet.ac.bd)");
      router.replace("/login");
    }
    // ── PROVIDER ISOLATION: password-only user tried Google ──
    if (googleError === "use_credentials") {
      toast.error("This account uses password login. Please sign in with your email and password.");
      router.replace("/login");
    }
  }, [googleError, router]);

  useEffect(() => {
    if (session?.user) {
      if (!session.user.onboardingCompleted) {
        router.push("/register");
      } else {
        const userRole=session.user.role;
        if(userRole==="MANAGER"){
          router.push("/manager/dashboard");
        }else if(userRole==="ADMIN"){
          router.push("/admin/dashboard");
        }else{
          router.push("/student/dashboard");
        }
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
    try {
      // 1. Trigger global loading via Redux
      await dispatch(loginUser(data));

      // ── PROVIDER PRE-CHECK ──
      // Before attempting signIn, check if this user exists and which provider they used.
      // This lets us show "Please login with Google" instead of a generic error.
      const checkRes = await fetch("/api/auth/check-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.toLowerCase().trim() }),
      });
      const { provider } = await checkRes.json();

      if (provider === "google") {
        toast.error("This account is linked to Google. Please sign in with Google.");
        dispatch(setLoading(false));
        return;
      }

      // 2. Perform NextAuth Sign In
      const result = await signIn("credentials", {
        type: "email",
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        dispatch(setLoading(false));
      } else {
        toast.success("Welcome back!");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Login failed");
      dispatch(setLoading(false));
    }
  };

  const handleGoogleLogin = async () => {
    dispatch(setLoading(true));
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
            <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-blue-600">
              Forgot password?
            </Link>
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
                disabled={isAuthLoading}
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
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 font-medium tracking-wider">Credentials</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
            {FORM_FIELDS.map((field) => renderFormField(field))}

            <Button type="submit" className="w-full h-11 font-bold transition-all" disabled={isAuthLoading}>
              {isAuthLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 font-medium tracking-wider">Identity Provider</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 font-medium transition-all"
            onClick={handleGoogleLogin}
            disabled={isAuthLoading}
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-slate-500 pt-2">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:text-blue-700 hover:underline font-bold transition-colors">
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