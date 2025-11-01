import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CardDemo from "@/components/cards-demo-3";
import { CardStack } from "@/components/ui/card-stack";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import FeaturesSectionDemo from "@/components/features-section-demo-3";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-700/[0.2] dark:text-emerald-500 px-1 py-0.5",
        className
      )}
    >
      {children}
    </span>
  );
};

export default function Home() {

const testimonials = [
  {
    quote:
      "MindDock has completely redefined how our team interacts with internal documents. Upload, chat, and extract insights within seconds — it's like having a genius researcher on demand.",
    name: "Aarav Mehta",
    designation: "Data Analyst at Quantix Labs",
    src: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    quote:
      "We replaced hours of manual reading with Nova’s instant answers. Our onboarding and project documentation process is now 10x faster.",
    name: "Sophia Turner",
    designation: "HR Lead at PeopleVerse",
    src: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    quote:
      "Nova feels like a teammate who never sleeps. We use it daily to summarize legal PDFs, draft responses, and even extract patterns from reports.",
    name: "Rahul Singh",
    designation: "Legal Operations Manager at JurisIQ",
    src: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    quote:
      "Finally, an AI that makes knowledge searchable and conversational. The integration with Supabase is seamless, and performance is top-tier.",
    name: "Mia Gonzalez",
    designation: "CTO at ByteFlow Systems",
    src: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    quote:
      "We feed thousands of research documents to MindDock, and Nova extracts exactly what we need — contextually accurate, lightning fast, and stunningly intuitive.",
    name: "Liam Johnson",
    designation: "AI Researcher at DeepCore Analytics",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
];

  
  const CARDS = [
    {
      id: 0,
      name: "Priya Mehta",
      designation: "Research Analyst",
      content: (
        <p>
          “Using the knowledge-base chat I uploaded my 200-page PDF, asked complex queries and got <Highlight>accurate insights in seconds</Highlight>. Truly a game-changer.”
        </p>
      ),
    },
    {
      id: 1,
      name: "Rahul Gupta",
      designation: "Team Lead – Documentation",
      content: (
        <p>
          “Our team scattered into multiple DOCX reports and CSV logs was a mess. With <Highlight>upload → index → chat</Highlight> flow it’s now one unified knowledge engine. Zero confusion.”
        </p>
      ),
    },
    {
      id: 2,
      name: "Ananya Singh",
      designation: "Enterprise Architect",
      content: (
        <p>
          “I asked about regulatory compliance within our PDF archives and got an answer with <Highlight>live citations pointing to page numbers</Highlight>. Makes auditing and decision-making so much faster.”
        </p>
      ),
    },
  ];
  
  return (
    <main className="relative overflow-hidden">
      {/* Animated background inspired by Aceternity Background Beams */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-1/2 left-1/2 h-[120vh] w-[120vw] -translate-x-1/2 rounded-full bg-linear-to-tr from-indigo-500/20 via-cyan-400/20 to-emerald-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-1/3 h-[60vh] w-[60vw] rounded-full bg-linear-to-tr from-fuchsia-500/10 to-yellow-400/10 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
      </div>

      {/* Hero Section */}
      <div className="relative flex h-[40rem] w-full overflow-hidden rounded-md bg-black/[0.96] antialiased md:items-center md:justify-center">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]",
        )}
      />

 
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0">
        <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
          Chat <br /> with any documents.
        </h1>
        <p className="text-center text-neutral-300 mt-4 text-lg">
          Upload PDFs, Word documents (DOCX), or CSV files and get instant answers
        </p>
        <div>

          <TextGenerateEffect  className="text-white text-center" words="Do smartwork by turning your documents into a conversational learning resource" />
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                Get started
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
<Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium px-10 py-4 rounded-xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 border border-emerald-500/20">
              <Link href="/upload">
                Upload documents
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-emerald-200/50 hover:border-emerald-400/80 text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white/10 dark:bg-black/20 backdrop-blur-md hover:bg-emerald-50/20 dark:hover:bg-emerald-900/20">
              <Link href="/query">
                Try asking a question
              </Link>
            </Button>
          </SignedIn>
        </div>
      </div>

      <div>
        
      </div>
    </div>

      {/* Features Section */}
      {/* <section className="container mx-auto grid grid-cols-1 gap-10 px-6 pb-20 lg:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>1. Upload PDFs, DOCX, or CSV securely via Clerk-auth.</li>
            <li>2. We chunk and embed with OpenAI.</li>
            <li>3. Vectors go to your Qdrant collection.</li>
            <li>4. Ask questions and get cited answers instantly.</li>
          </ol>
        </div>
        <div className="rounded-2xl border p-6">
          <h2 className="text-2xl font-semibold">Built with the best</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-lg border p-3">Next.js 16</div>
            <div className="rounded-lg border p-3">Supabase</div>
            <div className="rounded-lg border p-3">Qdrant</div>
            <div className="rounded-lg border p-3">OpenAI</div>
            <div className="rounded-lg border p-3">LangChain</div>
            <div className="rounded-lg border p-3">shadcn/ui</div>
          </div>
        </div>
      </section> */}

      <div className="flex items-center justify-around  py-12 px-4  ">
        <CardDemo />
        <CardStack  items={CARDS} />
      </div>
<AnimatedTestimonials  testimonials={testimonials}/>

<div id="feature">

  <FeaturesSectionDemo />
</div>
      {/* Logos/Testimonials Strip */}
      <section className="border-t border-b bg-muted/40 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-70">
            {['Acme Labs', 'Globex', 'Innotech', 'Umbrella', 'Stark AI'].map((n, i) => (
              <div key={i} className="text-sm font-medium tracking-wide">
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h3 className="text-3xl font-bold">Ready to chat with your knowledge base?</h3>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Upload a document and ask your first question in under a minute.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
            <Link href="/upload">
              Upload now
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm">
            <Link href="/query">
              Try a question
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
