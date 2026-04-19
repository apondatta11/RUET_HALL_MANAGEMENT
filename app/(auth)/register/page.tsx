"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
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
import Link from "next/link";
import { HALLS, MALE_HALLS, FEMALE_HALLS, GENDER } from "@/lib/constants";
import { Stepper, Step } from "@/components/ui/stepper";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser, completeOnboarding } from "@/store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// schema validation with zod for register
const registerSchema = z.object({
  name: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  email: z.string().min(1, "RUET email is required").email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// stepper form to get further info from student
const onboardingSchema = z.object({
  isResident: z.boolean(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  hallName: z.string().optional(),
  roomNumber: z.string().optional(),
}).refine((data) => {
  if (data.isResident) {
    return data.gender && data.hallName && data.roomNumber;
  }
  return true;
}, {
  message: "Gender, hall name and room number are required for resident students",
  path: ["hallName"],
});

type RegisterFormData = z.infer<typeof registerSchema>;
type OnboardingFormData = z.infer<typeof onboardingSchema>;

const FORM_FIELDS: Array<
  {
    name: keyof RegisterFormData;
    label: string;
    placeholder: string;
    type: string;
    showPasswordToggle?: boolean;
    passwordField?: "password" | "confirmPassword";
  }
> = [
    { name: "name", label: "Full Name", placeholder: "Your full name", type: "text" },
    { name: "email", label: "RUET Email", placeholder: "xxxxxxx@student.ruet.ac.bd", type: "email" },
    { name: "password", label: "Password", placeholder: "Create a password", type: "password", showPasswordToggle: true, passwordField: "password" },
    { name: "confirmPassword", label: "Confirm Password", placeholder: "Confirm your password", type: "password", showPasswordToggle: true, passwordField: "confirmPassword" },
  ];

const PASSWORD_REQUIREMENTS = {
  minLength: { label: "At least 8 characters", check: (v: string) => v.length >= 8 },
  uppercase: { label: "One uppercase letter", check: (v: string) => /[A-Z]/.test(v) },
  number: { label: "One number", check: (v: string) => /[0-9]/.test(v) },
};


function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();
  const dispatch = useAppDispatch();
  const { isLoading: isAuthLoading } = useAppSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const googleError = searchParams.get("error");

  useEffect(() => {
    if (googleError === "invalid_ruet_email") {
      toast.error("Please sign in with your RUET student email (@student.ruet.ac.bd)");
      router.replace("/register");
    }
  }, [googleError]);

  useEffect(() => {
    // If the user lands here but isn't onboarded, enforce they see step 1
    if (session?.user && !session?.user?.onboardingCompleted) {
      setActiveStep(1);
    }
  }, [session]);

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    trigger,
    watch: watchRegister,
  } = useForm<RegisterFormData>(
    {
      resolver: zodResolver(registerSchema),
      defaultValues: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      mode: "onChange",
    }
  );

  const {
    control: onboardingControl,
    handleSubmit: handleOnboardingSubmit,
    formState: { errors: onboardingErrors },
    watch,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      isResident: false,
      gender: undefined,
      hallName: "",
      roomNumber: "",
    },
  });
  // Observe field values live.
  const isResident = watch("isResident");
  const gender = watch("gender");
  const passwordValue = watchRegister("password") || "";

  // Determine which halls to show based on gender
  const availableHalls = gender === "FEMALE" ? FEMALE_HALLS : gender === "MALE" ? MALE_HALLS : HALLS;

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const resultAction = await dispatch(registerUser(data));

      if (registerUser.rejected.match(resultAction)) {
        // The API returns field-level errors like { email: ["msg"] } or { general: ["msg"] }
        // We extract the first readable message from whatever shape the error is.
        const payload = resultAction.payload;
        let errorMessage = "Registration failed";


        if (typeof payload === "string") {
          errorMessage = payload;
        } else if (payload && typeof payload === "object") {
          const messages = Object.values(payload)
            .filter(Array.isArray)
            .flat()
            .filter((msg): msg is string => typeof msg === "string");

          if (messages.length > 0) {
            errorMessage = messages[0];
          }
        }

        toast.error(errorMessage);

        // If the email is already registered (any provider), redirect to login
        if (
          typeof payload === "object" &&
          payload !== null &&
          "email" in (payload as object)
        ) {
          setTimeout(() => router.push("/login"), 1500);
        }
        return;
      }

      // After account creation, sign in through credentials provider
      const result = await signIn("credentials", {
        type: "email",
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Account created, but automatic login failed. Please sign in manually.");
        router.push("/login");
        return;
      }
      toast.success("Account created! Please finalize your profile.");
      setActiveStep(1);
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }
  };


  const onOnboardingSubmit = async (data: OnboardingFormData) => {
    try {
      const resultAction = await dispatch(completeOnboarding(data));

      if (completeOnboarding.rejected.match(resultAction)) {
        const payload = resultAction.payload;
        let errorMessage = "Failed to complete onboarding";

        if (typeof payload === "string") {
          errorMessage = payload;
        } else if (payload && typeof payload === "object") {
          const messages = Object.values(payload)
            .filter(Array.isArray)
            .flat()
            .filter((msg): msg is string => typeof msg === "string");

          if (messages.length > 0) {
            errorMessage = messages[0];
          } else if ('error' in (payload as any) && typeof (payload as any).error === "string") {
            errorMessage = (payload as any).error;
          }
        }
        toast.error(errorMessage);
        return;
      }

      toast.success("Profile fully completed!");
      
      // Pass a dummy or actual payload to updateSession to force `trigger: "update"` 
      // in the NextAuth JWT callback, which will generate a new secure cookie.
      await updateSession({ onboardingCompleted: true });

      const userRole= session?.user?.role;
      if(userRole==="MANAGER"){
        router.push("/manager/dashboard");
      }else if(userRole==="ADMIN"){
        router.push("/admin/dashboard");
      }else{
        router.push("/student/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save residency details");
    }
  };

  const handleGoogleSignUp = async () => {
    await signIn("google", { callbackUrl: "/register" });
  };

  const renderFormField = (field: typeof FORM_FIELDS[0]) => {
    const error = errors[field.name];// errors[name],errors[email]
    const isTouched = touchedFields[field.name];// touchedFields[name],touchedFields[email]
    const showError = isTouched && error;// showError will be true if both isTouched and error are true

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name}>{field.label}</Label>
        <div className="relative">
          <Controller
            name={field.name}
            control={control}
            render={({ field: controllerField }) => (
              /*
              field is generated by react hook form that decides which feild to control when u set the name to field.name & then it generates a object which looks like 
              {
                name: "email",
                value: "",
                onChange: fn,
                onBlur: fn,
                ref: ...
              }
              then we rename it to controllerField & pass it to the input component using spread operator
              */
              <Input
                {...controllerField}
                id={field.name}
                type={(field.passwordField === "password" && showPassword) ? "text" : (field.passwordField === "confirmPassword" && showConfirmPassword) ? "text" : field.type}
                // A smart way to handle password toggle as default type is password, so when we click the eye icon, the type changes to text and when we click it again, the type changes to password
                placeholder={field.placeholder}
                onChange={(e) => {
                  controllerField.onChange(e);
                  if (field.name === "email") {
                    trigger("email");
                  }
                }}
                className={showError ? "border-red-500 focus:border-red-500" : ""}
              />
            )}
          />
          {/* this part is for the eye button &  only runs when field.showPasswordToggle is true which is true in case of password and confirm password field. The part inside button is to show the state depending on which passwordfield is true or false */}
          {field.showPasswordToggle && (
            <button
              type="button"
              onClick={() => {
                if (field.passwordField === "password") {
                  setShowPassword(!showPassword);
                } else {
                  setShowConfirmPassword(!showConfirmPassword);
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {(field.passwordField === "password" ? showPassword : showConfirmPassword) ? (
                <FaEyeSlash className="w-4 h-4" />
              ) : (
                <FaEye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {showError && (
          <p className="text-xs text-red-500 mt-1">{error.message as string}</p>
        )}
        {/* password requirements block */}
        {field.name === "password" && (
          <div className="pt-2 space-y-1">
            <div className="flex flex-wrap gap-2">
              {Object.entries(PASSWORD_REQUIREMENTS).map(([key, req]) => {
                const isMet = req.check(passwordValue);
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center text-[10px] px-2 py-0.5 rounded-full border transition-all duration-300",
                      isMet
                        ? "bg-green-500/10 text-green-600 border-green-200 dark:border-green-900/50"
                        : "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50"
                    )}
                  >
                    <span className="mr-1">{isMet ? "✓" : "⚠"}</span>
                    {req.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const RegistrationForm = (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 font-medium">Account Setup</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
        {FORM_FIELDS.map((field) => renderFormField(field))}

        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 transition-all font-bold" disabled={isAuthLoading}>
          {isAuthLoading ? "Creating account..." : "Continue to Profile"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 font-medium">Or quick signup</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 border-2 border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
        onClick={handleGoogleSignUp}
        disabled={isAuthLoading}
      >
        <FcGoogle className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
    </div>
  );

  const OnboardingForm = (
    <form onSubmit={handleOnboardingSubmit(onOnboardingSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Controller
            name="isResident"
            control={onboardingControl}
            render={({ field: { value, onChange } }) => (
              <input
                type="checkbox"
                id="isResident"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
            )}
          />
          <Label htmlFor="isResident" className="text-sm font-bold cursor-pointer select-none">
            I am a resident student of RUET
          </Label>
        </div>

        <AnimatePresence>
          {isResident && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Gender Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Your Gender</Label>
                <div className="flex gap-4">
                  <Controller
                    name="gender"
                    control={onboardingControl}
                    render={({ field: controllerField }) => (
                      <label className={cn(
                        "flex-1 flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                        controllerField.value === "MALE"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      )}>
                        <input
                          type="radio"
                          name="gender"
                          value="MALE"
                          checked={controllerField.value === "MALE"}
                          onChange={(e) => controllerField.onChange(e.target.value)}
                          className="sr-only"
                        />
                        <span className={cn(
                          "font-medium",
                          controllerField.value === "MALE" ? "text-blue-600" : "text-slate-600"
                        )}>
                          Male
                        </span>
                      </label>
                    )}
                  />
                  <Controller
                    name="gender"
                    control={onboardingControl}
                    render={({ field: controllerField }) => (
                      <label className={cn(
                        "flex-1 flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                        controllerField.value === "FEMALE"
                          ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      )}>
                        <input
                          type="radio"
                          name="gender"
                          value="FEMALE"
                          checked={controllerField.value === "FEMALE"}
                          onChange={(e) => controllerField.onChange(e.target.value)}
                          className="sr-only"
                        />
                        <span className={cn(
                          "font-medium",
                          controllerField.value === "FEMALE" ? "text-pink-600" : "text-slate-600"
                        )}>
                          Female
                        </span>
                      </label>
                    )}
                  />
                </div>
                {onboardingErrors.gender && (
                  <p className="text-xs text-red-500 mt-1">Please select your gender</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hallName" className="text-sm font-medium">Hall Assignment</Label>
                <Controller
                  name="hallName"
                  control={onboardingControl}
                  render={({ field: controllerField }) => (
                    <select
                      {...controllerField}
                      id="hallName"
                      // will only show if gender is selected
                      disabled={!gender}
                      className="w-full h-10 px-3 rounded-md border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{gender ? "Select Hall" : "Select gender first"}</option>
                      {availableHalls.map((hall) => (
                        <option key={hall} value={hall}>{hall}</option>
                      ))}
                    </select>
                  )}
                />
                {onboardingErrors.hallName && (
                  <p className="text-xs text-red-500 mt-1">{onboardingErrors.hallName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomNumber" className="text-sm font-medium">Room Number</Label>
                <Controller
                  name="roomNumber"
                  control={onboardingControl}
                  render={({ field: controllerField }) => (
                    <Input
                      {...controllerField}
                      id="roomNumber"
                      placeholder={gender ? "e.g., 204" : "Select gender first"}
                      disabled={!gender}
                      className="border-2 focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  )}
                />
                {onboardingErrors.roomNumber && (
                  <p className="text-xs text-red-500 mt-1">{onboardingErrors.roomNumber.message}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 transition-all font-black text-lg" disabled={isAuthLoading}>
        {isAuthLoading ? "Completing setup..." : "Finish Profile Setup"}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <Card className="w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-0 overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center pb-2">
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {activeStep === 0 ? "Create Account" : "Profile Finalization"}
          </CardTitle>
          <CardDescription className="text-slate-500 text-base font-medium">
            {activeStep === 0 ? "Start your digital residency journey" : "Help us verify your hall assignment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6 pb-8">
          <Stepper activeStep={activeStep}>
            <Step title="Credentials">{RegistrationForm}</Step>
            <Step title="Onboarding">{OnboardingForm}</Step>
          </Stepper>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold transition-all">Sign in here</Link>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterPageContent />
    </Suspense>
  );
}