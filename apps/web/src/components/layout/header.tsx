import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export const Header = () => (
  <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="mx-auto flex h-14 max-w-container items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <FileText className="size-5" />
          <span>ocrbase</span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            to="/jobs"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
          >
            Jobs
          </Link>
        </nav>
      </div>
    </div>
  </header>
);
