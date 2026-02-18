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
    <header className="w-full bg-header rounded-b-lg px-6 py-4 flex items-center justify-between relative z-10">
      <button onClick={() => navigate("/")} className="flex flex-col leading-tight">
        <span className="text-xl font-bold text-header-foreground">Pasar</span>
        <span className="text-sm font-semibold text-primary">Online</span>
      </button>

      {location.pathname === "/" && (
        <div className="flex items-center bg-foreground/10 rounded-full px-4 py-2 gap-2 w-60">
          <Search className="w-5 h-5 text-secondary-foreground" />
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
