"use client";

import React, { useState, useEffect } from "react";
import { auth, signOut } from "../../lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { CiGlobe } from "react-icons/ci";
import Link from 'next/link'; // Add this import

const Navbar = () => {
  const [_user, setUser] = useState<User | null>(null); // Prefix with underscore since it's unused
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const _handleSignOut = async () => { // Prefix with underscore since it's unused
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className="bg-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div>
          <Link href="/"> {/* Replace <a> with Link */}
            <img src="/logo.png" alt="Skill Swap Logo" className="h-10" />
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <CiGlobe />
          {pathname === "/main-page" && (
            <button
              onClick={() => router.push("/about")}
              className="text-black bg-[#DBEC62] px-4 py-2 rounded hover:bg-[#F8F27D]"
            >
              About Me
            </button>
          )}
          {_user ? (
            <button
              onClick={_handleSignOut}
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