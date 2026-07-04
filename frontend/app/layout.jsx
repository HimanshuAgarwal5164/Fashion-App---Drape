import "./globals.css";

export const metadata = {
  title: "DRAPE — Fashion Recommendation App",
  description: "AI-powered outfit recommendations based on occasion and skin tone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
