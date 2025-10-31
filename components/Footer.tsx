"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  ArrowUp,
  Heart,
  Zap,
  Shield,
  Users,
  MessageCircle,
  Upload,
  BookOpen,
  Star
} from "lucide-react";

const footerLinks = {
  product: [
    { name: "Upload Documents", href: "/upload", icon: Upload },
    { name: "Chat with AI", href: "/query", icon: MessageCircle },
    { name: "Features", href: "/features", icon: Star },
    { name: "Pricing", href: "/pricing", icon: Zap }
  ],
  company: [
    { name: "About Us", href: "/about", icon: Users },
    { name: "Contact", href: "/contact", icon: Mail },
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "Careers", href: "/careers", icon: Heart }
  ],
  support: [
    { name: "Help Center", href: "/help", icon: Shield },
    { name: "Privacy Policy", href: "/privacy", icon: Shield },
    { name: "Terms of Service", href: "/terms", icon: Shield },
    { name: "Security", href: "/security", icon: Shield }
  ]
};

const socialLinks = [
  { 
    name: "GitHub", 
    href: "#", 
    icon: Github,
    hoverColor: "hover:text-gray-900 dark:hover:text-white"
  },
  { 
    name: "LinkedIn", 
    href: "#", 
    icon: Linkedin,
    hoverColor: "hover:text-blue-600"
  },
  { 
    name: "Twitter", 
    href: "#", 
    icon: Twitter,
    hoverColor: "hover:text-blue-400"
  },
  { 
    name: "Email", 
    href: "mailto:hello@pdfchat.com", 
    icon: Mail,
    hoverColor: "hover:text-red-500"
  }
];

const stats = [
  { number: "10K+", label: "Documents Processed" },
  { number: "5K+", label: "Happy Users" },
  { number: "99.9%", label: "Uptime" },
  { number: "24/7", label: "Support" }
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-background border-t border-border/40">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      </div>

      <div className="relative">
        {/* Stats Section */}
        <section className="border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="mb-2 text-3xl font-bold text-primary transition-transform duration-300 group-hover:scale-110 md:text-4xl">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Main Footer Content */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-4">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Link 
                href="/" 
                className="mb-6 flex items-center space-x-2 font-bold text-xl group"
              >
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2 transition-transform duration-300 group-hover:scale-110">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  PDF Chat
                </span>
              </Link>
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                Transform your documents into intelligent conversations. 
                Upload, chat, and discover insights with the power of AI.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3 group">
                  <Mail className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <a href="mailto:hello@pdfchat.com" className="hover:text-primary transition-colors">
                    hello@pdfchat.com
                  </a>
                </div>
                <div className="flex items-center gap-3 group">
                  <Phone className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <a href="tel:+15551234567" className="hover:text-primary transition-colors">
                    +1 (555) 123-4567
                  </a>
                </div>
                <div className="flex items-center gap-3 group">
                  <MapPin className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <span>123 Innovation St, Tech City</span>
                </div>
              </div>
            </motion.div>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-foreground">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: linkIndex * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={link.href}
                        className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        <link.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" />
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          {link.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="border-t border-border/40 bg-muted/20">
          <div className="container mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="mb-4 text-2xl font-bold">Stay Updated</h3>
              <p className="mb-6 text-muted-foreground max-w-2xl mx-auto">
                Get the latest updates about new features, improvements, and AI advancements 
                directly in your inbox.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105">
                  Subscribe
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="border-t border-border/40">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              {/* Copyright */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span>© 2025 PDF Chat. Made with</span>
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span>by Team Pritam</span>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                {socialLinks.map((social, index) => (
                  <motion.div
                    key={social.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className={`group transition-all duration-300 hover:scale-110 ${social.hoverColor}`}
                    >
                      <a href={social.href} aria-label={social.name}>
                        <social.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                      </a>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>

              {/* Scroll to Top */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollToTop}
                  className="group transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                >
                  <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1" />
                  <span className="ml-2">Back to Top</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}