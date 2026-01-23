import { Baby, Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-semibold">
                  📅 Agenda
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
                  👶 Crianças
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
                  📝 Recados
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors">
                  📸 Galeria
                </a>
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-xl p-2 shadow-soft">
              <Baby className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">Creche Arco-Íris</h1>
              <p className="text-xs text-muted-foreground">Turma das Estrelas</p>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" className="font-semibold text-primary">
            📅 Agenda
          </Button>
          <Button variant="ghost" className="font-medium">
            👶 Crianças
          </Button>
          <Button variant="ghost" className="font-medium">
            📝 Recados
          </Button>
          <Button variant="ghost" className="font-medium">
            📸 Galeria
          </Button>
        </nav>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-[10px] text-primary-foreground font-bold flex items-center justify-center">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
