import { useState } from "react";
import { setUsername } from "@/lib/store";

interface UsernameModalProps {
  onComplete: (name: string) => void;
}

const UsernameModal = ({ onComplete }: UsernameModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUsername(name.trim());
      onComplete(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-popover rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <h2 className="text-xl font-bold text-popover-foreground mb-2">
          Selamat Datang! 👋
        </h2>
        <p className="text-sm text-popover-foreground/60 mb-6">
          Masukkan nama Anda untuk mulai berbelanja di Pasar Online
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Anda"
            className="w-full px-4 py-3 rounded-xl bg-input text-popover-foreground placeholder:text-popover-foreground/40 outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;
