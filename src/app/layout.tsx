// src/app/layout.tsx

import './globals.css'
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <head>
        <title>Skillshare</title>
      </head>
      <body>{children}</body>
    </html>
  );
};

export default Layout;
