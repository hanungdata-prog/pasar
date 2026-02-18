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
        <svg width="120" height="40" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="35" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#2D5F4C">Pasar</text>
          <text x="10" y="55" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="#7CB393">Online</text>
        </svg>
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
