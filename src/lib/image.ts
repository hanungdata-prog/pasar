export const getImageUrl = (url: string | undefined): string => {
    if (!url) return "/placeholder.svg";
    return url.replace(
        "https://pub-2cf8fd725eab4bdc8cc7849512fe3419.r2.dev",
        "https://cdn.pasar.harch.site"
    );
};
