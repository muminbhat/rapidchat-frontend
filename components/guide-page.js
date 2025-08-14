"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Shield, ArrowRight, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Experience instant messaging with real-time updates and seamless conversations "
  },
  {
    icon: Users,
    title: "Connect with Everyone",
    description: "See all registered users and start chatting with anyone in the community"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your conversations are protected with secure authentication and privacy"
  }
];

export default function GuidePage() {
  const router = useRouter();

  return (
    <div className="h-full relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_oklch(0.45_0.15_180_/_0.03)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_oklch(0.55_0.12_200_/_0.03)_0%,_transparent_50%)]" />
      
      <div className="relative z-10 h-full flex flex-col justify-center overflow-hidden">
        <div className="container mx-auto mobile-container px-4 py-4 lg:py-6 overflow-y-auto max-h-full hide-scrollbar">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 lg:mb-8"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-3 lg:mb-4 shadow-lg"
            >
              <Sparkles className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="text-xl lg:text-2xl xl:text-4xl 2xl:text-5xl font-bold gradient-text mb-2 lg:mb-3">
              Welcome to RapidQuest
            </h1>
            <p className="text-xs lg:text-sm xl:text-base text-muted-foreground max-w-2xl mx-auto">
              Your modern messaging platform for seamless real-time conversations
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8 max-w-4xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="modern-card p-3 lg:p-4 xl:p-6 space-y-2 lg:space-y-3"
              >
                <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg">
                  <feature.icon className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-primary-foreground" />
                </div>
                <h3 className="text-sm lg:text-base xl:text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-xs lg:text-sm xl:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-3xl mx-auto mb-6 lg:mb-8"
          >
            <div className="modern-card p-3 lg:p-4 xl:p-6">
              <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-foreground mb-3 lg:mb-4 xl:mb-6 text-center">
                How it works
              </h2>
              <div className="space-y-3 lg:space-y-4 xl:space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="flex items-start gap-2 lg:gap-3 xl:gap-4"
                >
                  <div className="flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold shadow-lg text-xs lg:text-sm xl:text-base">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 text-xs lg:text-sm xl:text-base">
                      Register with username and password
                    </h3>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Create your account quickly with just a username and password
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex items-start gap-2 lg:gap-3 xl:gap-4"
                >
                  <div className="flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 bg-primary/80 text-primary-foreground rounded-full flex items-center justify-center font-semibold shadow-lg text-xs lg:text-sm xl:text-base">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 text-xs lg:text-sm xl:text-base">
                      Discover other users
                    </h3>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Browse through all registered users in the community
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="flex items-start gap-2 lg:gap-3 xl:gap-4"
                >
                  <div className="flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 bg-primary/60 text-primary-foreground rounded-full flex items-center justify-center font-semibold shadow-lg text-xs lg:text-sm xl:text-base">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 text-xs lg:text-sm xl:text-base">
                      Start chatting instantly
                    </h3>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      Begin real-time conversations with anyone you choose
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-2 lg:gap-3 xl:gap-4 justify-center items-center"
          >
            <Button
              onClick={() => router.push("/signup")}
              size="lg"
              className="btn-primary px-4 lg:px-6 xl:px-8 py-2 lg:py-2 xl:py-3 rounded-xl font-semibold text-sm lg:text-base xl:text-lg shadow-lg hover:shadow-xl transition-all duration-300 group w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="ml-2 w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              size="lg"
              className="px-4 lg:px-6 xl:px-8 py-2 lg:py-2 xl:py-3 rounded-xl font-semibold text-sm lg:text-base xl:text-lg transition-all duration-300 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center mt-4 lg:mt-6 xl:mt-8 text-muted-foreground"
          >
            <p className="text-xs lg:text-sm">
              Experience the future of messaging with RapidQuest
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
