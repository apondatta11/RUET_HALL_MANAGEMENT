"use client";

import { motion } from "framer-motion";
import { 
  IconTicket,
  IconCreditCard,
  IconClock,
  IconBuildingSkyscraper,
  IconChartLine,
  IconBell
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: IconTicket,
    title: "Meal Token Booking",
    description: "Pre-order your lunch and dinner tokens 24 hours in advance. Skip the queue and guarantee your meal.",
    badge: "Core Feature",
    color: "bg-blue-500",
  },
  {
    icon: IconCreditCard,
    title: "Digital Wallet",
    description: "Add funds securely via bKash, Nagad, or card. Your balance is protected with enterprise-grade security.",
    badge: "Payment",
    color: "bg-green-500",
  },
  {
    icon: IconClock,
    title: "Smart Scheduling",
    description: "Plan your meals weekly. Get reminders and never miss a meal slot again.",
    badge: "Time Saving",
    color: "bg-purple-500",
  },
  {
    icon: IconBuildingSkyscraper,
    title: "Hall Management",
    description: "Track real-time capacity across all halls. Make informed decisions about where to eat.",
    badge: "Analytics",
    color: "bg-orange-500",
  },
  {
    icon: IconChartLine,
    title: "Spending Insights",
    description: "View your meal history, spending patterns, and nutritional insights on your dashboard.",
    badge: "Insights",
    color: "bg-pink-500",
  },
  {
    icon: IconBell,
    title: "Real-time Notifications",
    description: "Get instant alerts for transaction confirmations, token expiry, and special meal offers.",
    badge: "Updates",
    color: "bg-cyan-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete digital solution for RUET hall dining management. 
            Designed for students, by students.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {feature.badge}
                  </Badge>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}