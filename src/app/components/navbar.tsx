"use client";

import React, { useState, useEffect } from "react";
import { auth, signOut } from "../../lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation"; // Import usePathname to get the current path
import { CiGlobe } from "react-icons/ci";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to home page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Prevent mismatched SSR content
  }

  return (
    <nav className="bg-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div>
          <a href="/">
            <img src="/logo.png" alt="Skill Swap Logo" className="h-10" />
          </a>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <CiGlobe />
          {pathname === "/main-page" && ( // Show the button only on the main-page
            <button
              onClick={() => router.push("/about")}
              className="text-black bg-[#DBEC62] px-4 py-2 rounded hover:bg-[#F8F27D]"
            >
              About Me
            </button>
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-black bg-[#F8F27D] px-4 py-2 rounded hover:bg-[#DBEC62]"
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={() => router.push("/")}
              className="text-black bg-[#DBEC62] px-4 py-2 rounded hover:bg-[#F8F27D]"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
