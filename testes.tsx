import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "../ui/popover";
import { Avatar } from "../ui/avatar";
// ...other imports

export function Navbar() {
  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-background">
      <nav className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* ...other navbar content... */}

        {/* User Menu - Popover replacing DropdownMenu */}
        <Popover>
          <PopoverTrigger asChild>
            <button>
              <Avatar src="/user-avatar.jpg" alt="User avatar" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <PopoverArrow />
            <div className="flex flex-col gap-2">
              <a
                href="/profile"
                className="hover:bg-accent rounded px-3 py-2 text-sm"
              >
                Profile
              </a>
              <button className="hover:bg-accent rounded px-3 py-2 text-sm text-left">
                Log Out
              </button>
              {/* Add more items as needed */}
            </div>
          </PopoverContent>
        </Popover>
      </nav>
    </header>
  );
}
