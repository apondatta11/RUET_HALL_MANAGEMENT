"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { IconUsers, IconAward, IconTarget, IconBuilding } from "@tabler/icons-react";

export function AboutSection() {
  const stats = [
    { value: "5000+", label: "Active Students", icon: IconUsers },
    { value: "10+", label: "Halls Covered", icon: IconBuilding },
    { value: "99.9%", label: "Uptime", icon: IconAward },
    { value: "24/7", label: "Support", icon: IconTarget },
  ];

  return (
    <section id="about" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <Badge variant="outline" className="mb-4">
                About Us
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Revolutionizing RUET Dining
              </h2>
              <p className="text-lg text-muted-foreground">
                We're building the future of campus dining at RUET. Our mission is to 
                eliminate queues, reduce waste, and provide a seamless meal booking 
                experience for every student.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="p-4 rounded-xl bg-muted/50"
                >
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <Button asChild>
              <Link href="/register">Join Us Today</Link>
            </Button>
          </motion.div>

          {/* Right Content - Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-accent/20 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-black text-primary mb-4">RUET</div>
                <div className="text-xl font-medium text-muted-foreground">
                  Hall Management System
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Rajshahi University of Engineering & Technology
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}