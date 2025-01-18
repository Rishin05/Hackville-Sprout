"use client";

import { useState, useEffect } from 'react';
import { auth, googleAuthProvider, emailAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from '../lib/firebase'; // Correct imports
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Import useRouter
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase'; // Correct import for firestore

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        checkUserProfile(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const checkUserProfile = async (user: User) => {
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Check if user has filled out all the required fields
      if (
        userData?.name &&
        userData?.gender &&
        userData?.skills &&
        userData?.skillsToLearn
      ) {
        // If profile is complete, redirect to main-page
        router.push('/main-page');
      } else {
        // If profile is incomplete, redirect to basic-info page
        router.push('/basic-info');
      }
    } else {
      // If no user data found, redirect to basic-info page
      router.push('/basic-info');
    }
  };

  const handleSignInWithGoogle = async () => {
    await signInWithPopup(auth, googleAuthProvider);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleSignInWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
    }
  };

  const handleSignUpWithEmail = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing up with email:', error);
    }
  };

  return (
    <div>
      <h1>Welcome to Sprout</h1>

      {!user ? (
        <div>
          <button onClick={handleSignInWithGoogle}>Sign in with Google</button>

          <div>
            <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={isSignUp ? handleSignUpWithEmail : handleSignInWithEmail}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            <p>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      ) : (
        <>
          <h2>Welcome, {user.displayName}</h2>
          <button onClick={handleSignOut}>Sign Out</button>
        </>
      )}
    </div>
  );
};

export default Home;
