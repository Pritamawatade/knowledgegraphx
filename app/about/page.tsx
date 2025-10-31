"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spotlight } from "@/components/ui/spotlight";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { FlipWords } from "@/components/ui/flip-words";
import { 
  Github, 
  Linkedin, 
  Mail, 
  Users, 
  Target, 
  Lightbulb, 
  Code, 
  Database,
  Brain,
  Zap,
  Star,
  Award,
  Rocket
} from "lucide-react";
import Link from "next/link";

const teamMembers = [
  {
    name: "Pritam Awatade",
    role: "Team Leader & Full Stack Developer",
    description: "Leading the project with expertise in Next.js, React, and system architecture. Passionate about creating seamless user experiences.",
    skills: ["Next.js", "React", "TypeScript", "System Design"],
    github: "https://github.com/pritamawatade",
    linkedin: "https://github.com/pritam-awatade",
    email: "pritamawatade.work@gmail.com",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    name: "Aman",
    role: "Backend Developer & AI Integration",
    description: "Specializing in backend development and AI integration. Expert in building robust APIs and implementing machine learning solutions.",
    skills: ["Node.js", "Python", "OpenAI API", "Supabase"],
    github: "https://github.com/pritamawatade",
    linkedin: "https://github.com/pritam-awatade",
    email: "aman@example.com",
    gradient: "from-green-500 to-teal-600"
  },
  {
    name: "Ved",
    role: "Frontend Developer & UI/UX",
    description: "Crafting beautiful and intuitive user interfaces. Focused on creating engaging user experiences with modern design principles.",
    skills: ["React", "Tailwind CSS", "Framer Motion", "shadcn/ui"],
    github: "https://github.com/pritamawatade",
    linkedin: "https://github.com/pritam-awatade",
    email: "ved@example.com", 
    gradient: "from-orange-500 to-red-600"
  },
  {
    name: "Amul",
    role: "DevOps & Database Engineer",
    description: "Managing deployment pipelines and database optimization. Ensuring scalable and reliable infrastructure for the application.",
    skills: ["Docker", "PostgreSQL", "Vector DB", "Cloud Services"],
    github: "https://github.com/pritamawatade",
    linkedin: "https://github.com/pritam-awatade",
    email: "amul@example.com",
    gradient: "from-purple-500 to-pink-600"
  }
];

const technologies = [
  { name: "Next.js", icon: Code, description: "React framework for production" },
  { name: "Supabase", icon: Database, description: "Backend as a Service" },
  { name: "OpenAI", icon: Brain, description: "AI-powered conversations" },
  { name: "Tailwind CSS", icon: Zap, description: "Utility-first CSS framework" },
  { name: "shadcn/ui", icon: Star, description: "Beautiful UI components" },
  { name: "Framer Motion", icon: Rocket, description: "Production-ready animations" }
];

const words = ["innovative", "intelligent", "seamless", "powerful"];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex h-[50vh] w-full overflow-hidden bg-black/[0.96] antialiased md:items-center md:justify-center">
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              About Our Team
            </h1>
            <div className="mx-auto mt-4 max-w-2xl text-lg text-neutral-300">
              We're building the future of document interaction with{" "}
              <FlipWords words={words} className="text-blue-400 font-semibold" />
              <br />
              AI-powered conversations.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-3">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're on a mission to revolutionize how people interact with documents. 
              By combining cutting-edge AI technology with intuitive design, we're making 
              it possible for anyone to have meaningful conversations with their PDFs, 
              research papers, and knowledge bases. Our goal is to break down the barriers 
              between information and understanding.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-green-500 to-teal-600 p-3">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Meet Our Team</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Four passionate students working together to create something amazing
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
                <CardHeader className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${member.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={member.github}>
                          <Github className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={member.linkedin}>
                          <Linkedin className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`mailto:${member.email}`}>
                          <Mail className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-sm font-medium text-primary">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                    {member.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 p-3">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Built with Modern Tech</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              We use cutting-edge technologies to deliver the best experience
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <tech.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">{tech.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Stats */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-600 p-3">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Project Highlights</h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            { number: "4", label: "Team Members", description: "Passionate students" },
            { number: "6", label: "Technologies", description: "Modern tech stack" },
            { number: "∞", label: "Possibilities", description: "With AI integration" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mb-4 text-4xl font-bold text-primary md:text-5xl">
                {stat.number}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{stat.label}</h3>
              <p className="text-muted-foreground">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Experience the Future?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
              Join us in revolutionizing document interaction. Upload your first document 
              and start having intelligent conversations today.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
              >
                <Link href="/upload">
                  Try It Now
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-white text-black dark:text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3"
              >
                <Link href="/query">
                  Start Chatting
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}