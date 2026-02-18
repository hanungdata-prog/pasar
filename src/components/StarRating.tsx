import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
}

const StarRating = ({ rating, onRate, size = 16, interactive = false }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate?.(star)}
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
        >
          <Star
            size={size}
            className={
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-foreground/30"
            }
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
