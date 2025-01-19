import './globals.css';
import { ReactNode } from 'react';
import Navbar from './components/navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <head>
        <title>Sprout</title>
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
};

export default Layout;
