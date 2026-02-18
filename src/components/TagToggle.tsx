import { Check } from "lucide-react";

interface TagToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const TagToggle = ({ label, active, onClick }: TagToggleProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-accent text-accent-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }`}
    >
      {active && <Check className="w-4 h-4" />}
      {label}
    </button>
  );
};

export default TagToggle;
