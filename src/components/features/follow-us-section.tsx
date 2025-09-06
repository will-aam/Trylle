import { Instagram, Github } from "lucide-react";

export function FollowUsSection() {
  return (
    <section className="py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight">Connect With Us</h2>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#"
            className="text-foreground transition-transform hover:scale-110"
          >
            <Instagram className="h-8 w-8" />
          </a>
          <a
            href="#"
            className="text-foreground transition-transform hover:scale-110"
          >
            <Github className="h-8 w-8" />
          </a>
        </div>
      </div>
    </section>
  );
}
