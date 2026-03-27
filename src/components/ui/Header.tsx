import { Link } from "react-router-dom";
import Container from "@src/components/ui/Container";

export default function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <Container>
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="font-semibold tracking-tight text-lg">
            YaYin
          </Link>
          <div className="text-xs text-muted-foreground">Vite · React · Tailwind v4</div>
        </div>
      </Container>
    </header>
  );
}