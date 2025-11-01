"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ArrowLeft, 
  Code, 
  Coffee, 
  Zap,
  Wrench,
  Sparkles,
  FileText
} from "lucide-react";

const floatingIcons = [
  { icon: Code, delay: 0, x: 20, y: 30 },
  { icon: Coffee, delay: 0.5, x: -30, y: 20 },
  { icon: Zap, delay: 1, x: 40, y: -20 },
  { icon: Wrench, delay: 1.5, x: -20, y: -30 },
  { icon: Sparkles, delay: 2, x: 30, y: 40 },
  { icon: FileText, delay: 2.5, x: -40, y: 10 }
];

const glitchText = "404";
const developmentMessages = [
  "Crafting something amazing...",
  "Brewing the perfect experience...",
  "Building the future of DocWise...",
  "Polishing every pixel...",
  "Almost ready for you..."
];

const seeded = (index: number, salt: number = 0) => {
  let x = (index + 1) * 374761393 + salt * 668265263;
  x = (x ^ (x >>> 13)) * 1274126177;
  x = (x ^ (x >>> 16)) >>> 0;
  return (x % 1000000) / 1000000;
};

export default function NotFound() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % developmentMessages.length);
    }, 3000);

    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 4000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]" />
      </div>

      {/* Floating background icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-muted-foreground/20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, item.x, 0],
            y: [0, item.y, 0],
            rotate: [0, 360, 0]
          }}
          transition={{
            duration: 6,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + seeded(index, 21) * 60}%`,
            top: `${20 + seeded(index, 21) * 60}%`
          }}
        >
          <item.icon className="h-8 w-8" />
        </motion.div>
      ))}

      <div className="text-center px-6 max-w-4xl mx-auto">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.h1
            className={`text-8xl md:text-9xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent select-none ${
              isGlitching ? 'animate-pulse' : ''
            }`}
            animate={isGlitching ? {
              x: [0, -5, 5, -5, 5, 0],
              textShadow: [
                "0 0 0 transparent",
                "2px 0 0 #ff0000, -2px 0 0 #00ff00",
                "0 0 0 transparent"
              ]
            } : {}}
            transition={{ duration: 0.2 }}
          >
            {glitchText.split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
        </motion.div>

        {/* Main message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Page Under Development
          </h2>
          <div className="h-8 flex items-center justify-center">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-lg text-muted-foreground"
            >
              {developmentMessages[messageIndex]}
            </motion.p>
          </div>
        </motion.div>

        {/* Animated construction elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12 flex justify-center items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <Wrench className="h-6 w-6 text-white" />
          </motion.div>
          
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl"
          >
            🚧
          </motion.div>
          
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600"
          >
            <Code className="h-6 w-6 text-white" />
          </motion.div>
        </motion.div>

        {/* Progress bar animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mb-12"
        >
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Development Progress</span>
              <span>85%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
              >
                <motion.div
                  animate={{ x: [0, 100, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-white/30 w-8 skew-x-12"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            asChild
            size="lg"
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              Back to Home
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group border-2 hover:border-primary font-semibold px-8 py-3 transition-all duration-300 hover:scale-105"
          >
            <Link href="/about">
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
              Learn About Us
            </Link>
          </Button>
        </motion.div>

        {/* Fun fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mt-16 p-6 rounded-2xl bg-muted/50 border border-border/50 backdrop-blur-sm"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-3"
          >
            💡
          </motion.div>
          <p className="text-sm text-muted-foreground">
            <strong>Fun Fact:</strong> While you wait, our AI is learning to understand documents better! 
            Soon you'll be able to chat with your PDFs in ways you never imagined.
          </p>
        </motion.div>
      </div>

      {/* Floating particles - deterministic and SSR-safe */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          style={{
            left: `${seeded(i, 101) * 100}%`,
            top: `${seeded(i, 151) * 100}%`,
          }}
          initial={{
            y: 0,
            opacity: 0,
          }}
          animate={{
            y: -100,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + seeded(i, 181) * 3,
            repeat: Infinity,
            delay: seeded(i, 199) * 2,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}