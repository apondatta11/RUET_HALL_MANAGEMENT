"use client";

import React, { Children, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  children: React.ReactNode;
  activeStep: number;
  onStepChange?: (step: number) => void;
  className?: string;
  stepClassName?: string;
  contentClassName?: string;
}

interface StepProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Step = ({ children, className }: StepProps) => {
  return <div className={cn("w-full", className)}>{children}</div>;
};

export const Stepper = ({
  children,
  activeStep,
  className,
  stepClassName,
  contentClassName,
}: StepperProps) => {
  const steps = Children.toArray(children) as React.ReactElement<StepProps>[];
  const currentStep = steps[activeStep];

  return (
    <div className={cn("w-full space-y-8", className)}>
      {/* Step Indicators */}
      <div className={cn("flex items-center justify-between px-2", stepClassName)}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center relative z-10">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: index <= activeStep ? "var(--primary)" : "var(--muted)",
                  scale: index === activeStep ? 1.1 : 1,
                }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 border-2",
                  index < activeStep ? "bg-primary border-primary text-primary-foreground" : 
                  index === activeStep ? "bg-background border-primary text-primary" : 
                  "bg-muted border-muted text-muted-foreground"
                )}
              >
                {index < activeStep ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </motion.div>
              <span
                className={cn(
                  "mt-2 text-xs font-semibold absolute -bottom-6 whitespace-nowrap",
                  index <= activeStep ? "text-primary dark:text-primary" : "text-muted-foreground"
                )}
              >
                {step.props.title}
              </span>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 bg-muted relative -top-3">
                <motion.div
                  initial={false}
                  animate={{
                    width: index < activeStep ? "100%" : "0%",
                  }}
                  className="absolute h-full bg-primary transition-all duration-300"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className={cn("pt-4", contentClassName)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {currentStep}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
