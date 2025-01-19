"use client";

import { useState, useEffect } from "react";
import {
  auth,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "../lib/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Footer from "./components/footer";

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        router.push("/main-page"); 
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/"); // Redirect to home page after sign out
  };

  const handleSignInWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/main-page"); 
    } catch (error) {
      console.error("Error signing in with email:", error);
      setErrorMessage("Failed to sign in. Please check your credentials.");
    }
  };

  const handleSignUpWithEmail = async () => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/basic-info"); // Redirect to the basic-info page after sign up
    } catch (error) {
      console.error("Error signing up with email:", error);
      setErrorMessage("Failed to sign up. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* First Div: Motto and Signup Form */}
      <div className="flex flex-col md:flex-row items-center justify-normal p-8 bg-[#FAFAFA]">
        <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0 ml-12">
          <h1 className="text-4xl font-bold">
            Every Student Shares,<br />
            Every Skill Matters
          </h1>
        </div>
        <div className="w-1/3 bg-white p-8 rounded-lg shadow-md mr-12 ml-12 justify-start">
          <h2 className="text-2xl font-semibold mb-4">
            {isSignUp ? "Sign Up through your Student Email" : "Sign In through your Student Email"}
          </h2>

          {/* Email input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Student Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-black rounded-lg"
            />
          </div>

          {/* Password input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-black rounded-lg"
            />
          </div>

          {/* Confirm Password input (only for sign-up) */}
          {isSignUp && (
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-black rounded-lg"
              />
            </div>
          )}

          {/* Error message */}
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

          {/* Submit button */}
          <button
            onClick={isSignUp ? handleSignUpWithEmail : handleSignInWithEmail}
            className="w-full bg-[#DBEC62] py-2 px-4 rounded-lg mb-4 hover:bg-[#F8F27D]"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          {/* Toggle between sign-up and sign-in */}
          <p className="text-center">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-500 ml-2 hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>

      {/* Second Div: Image Carousel */}
      <div className="bg-[#FAFAFA] p-8 overflow-hidden flex justify-center">
        <div className="flex gap-7 items-center">
          {/* First set of static images */}
          <div className="w-64 h-64 rounded-lg">
            <img src="/p1.png" alt="Image 1" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="w-64 h-64 rounded-lg">
            <img src="/p2.png" alt="Image 2" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="w-64 h-64 rounded-lg">
            <img src="/p3.png" alt="Image 3" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="w-64 h-64 rounded-lg">
            <img src="/p4.png" alt="Image 4" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="w-64 h-64 rounded-lg">
            <img src="/p5.png" alt="Image 5" className="w-full h-full object-cover rounded-lg" />
          </div>
        </div>
      </div>

      {/* Third Div: Tagline, Bullet Points, and Buttons */}
      <div className="p-8 bg-[#FAFAFA]">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          {/* Left side: Motto */}
          <div className="md:w-1/3 flex items-center justify-end md:text-center">
            <h3 className="text-3xl font-semibold">
              Where every <br />
              talent thrives!
            </h3>
          </div>

          {/* Right side: List with images as bullet points */}
          <div className="md:w-2/3 flex flex-col items-center justify-center">
            <ul className="mt-4 space-y-2">
              <li className="flex items-center font-bold">
                <img src="leaf.png" alt="Bullet" className="w-4 h-4 mr-2" />
                Share and learn any skill that sparks your passion.
              </li>
              <li className="flex items-center font-bold">
                <img src="leaf.png" alt="Bullet" className="w-4 h-4 mr-2" />
                Connect with students who excel in their unique domains.
              </li>
              <li className="flex items-center font-bold">
                <img src="leaf.png" alt="Bullet" className="w-4 h-4 mr-2" />
                Follow your skill tree to track your progress and growth.
              </li>
              <li className="flex items-center font-bold">
                <img src="leaf.png" alt="Bullet" className="w-4 h-4 mr-2" />
                Earn certificates as you master new skills and help others.
              </li>
            </ul>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <button className="bg-[#73562F] text-[#DBEC62] px-6 py-3 rounded-lg">
            <p className="text-center">
              50+<br />
              <span className="inline-block text-white">SKILLS</span>
            </p>
          </button>

          <button className="bg-[#73562F] text-[#DBEC62] px-6 py-3 rounded-lg">
            <p className="text-center">
              6k+<br />
              <span className="inline-block text-white">MEMBERS</span>
            </p>
          </button>

          <button className="bg-[#73562F] text-[#DBEC62] px-6 py-3 rounded-lg">
            <p className="text-center">
              8k+<br />
              <span className="inline-block text-white">REVIEWS</span>
            </p>
          </button>

          <button className="bg-[#73562F] text-[#DBEC62] px-6 py-3 rounded-lg">
            <p className="text-center">
              4.8 ⭐⭐⭐⭐⭐<br />
              <span className="inline-block text-white">RATING</span>
            </p>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
