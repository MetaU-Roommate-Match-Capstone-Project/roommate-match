export const getUrl = () => {
  if (import.meta.env.DEV) {
    return ""; // relative url
  } else {
    return (
      import.meta.env.VITE_API_URL || "https://roommate-match-doe3.onrender.com"
    );
  }
};
