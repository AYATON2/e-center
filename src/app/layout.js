import "./globals.css";
import LayoutWrapper from "../components/LayoutWrapper";
import SmsNotifier from "../components/SmsNotifier";

export const metadata = {
  title: "BHCMS | Barangay Health Center",
  description: "Offline-first health center management system for Philippines",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <SmsNotifier />
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
