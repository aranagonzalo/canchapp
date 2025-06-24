interface StarRatingProps {
    rating: number;
    totalReviews: number;
    showTotal?: boolean;
    totalTextColor?: string;
}

export function StarRating({
    rating,
    totalReviews,
    showTotal = false,
    totalTextColor = "text-gray-400",
}: StarRatingProps) {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const partialFill = rating % 1;
    const emptyStars = totalStars - fullStars - (partialFill > 0 ? 1 : 0);

    return (
        <div className="flex items-center gap-1 text-sm mb-1 font-sans font-semibold tracking-tight leading-none">
            {[...Array(fullStars)].map((_, i) => (
                <span key={`full-${i}`} className="text-yellow-400 text-[17px]">
                    ★
                </span>
            ))}

            {partialFill > 0 && (
                <span className="relative text-[17px]">
                    <span className="text-gray-500">★</span>
                    <span
                        className="absolute top-0 left-0 overflow-hidden text-yellow-400"
                        style={{ width: `${partialFill * 100}%` }}
                    >
                        ★
                    </span>
                </span>
            )}

            {[...Array(emptyStars)].map((_, i) => (
                <span key={`empty-${i}`} className="text-gray-500 text-[17px]">
                    ★
                </span>
            ))}
            {showTotal && (
                <span className={`${totalTextColor} text-sm ml-1 font-normal`}>
                    {rating?.toFixed(1)} ({totalReviews} reseñas)
                </span>
            )}
        </div>
    );
}
