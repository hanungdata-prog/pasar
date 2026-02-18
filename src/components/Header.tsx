import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  return (
    <header className="w-full bg-header rounded-b-lg px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between relative z-10">
      <button onClick={() => navigate("/")} className="leading-tight">
        <img src="/pasaronline.png" alt="Pasar Online" className="h-12 sm:h-16 w-auto object-contain" />
      </button>

      {location.pathname === "/" && (
        <div className="flex items-center bg-foreground/10 rounded-full px-3 sm:px-4 py-2 gap-2 w-40 sm:w-60">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-foreground" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-header-foreground placeholder:text-secondary-foreground w-full"
          />
        </div>
      )}
    </header>
  );
};

export default Header;
