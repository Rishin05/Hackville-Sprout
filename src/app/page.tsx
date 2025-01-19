"use client";

import { useState, useEffect } from 'react';
import { auth, googleAuthProvider, emailAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from '../lib/firebase'; 
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation'; 
import { ref as dbRef, onValue, off } from 'firebase/database'; // Import Realtime Database methods
import { database } from '../lib/firebase'; // Import your Realtime Database instance

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        checkUserProfile(user); // Check user profile after login
      }
    });

    return () => unsubscribe();
  }, [router]);

  const checkUserProfile = async (user: User) => {
    const userRef = dbRef(database, `users/${user.uid}`); // Use Realtime Database ref
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

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
    });

    // Cleanup subscription
    return () => off(userRef);
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
