"use client";

import { useState } from 'react';
import { auth, firestore } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

const BasicInfo = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [program, setProgram] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (auth.currentUser) {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        name,
        age,
        gender,
        program,
      }, { merge: true });

      // Redirect to skill selection page after submitting basic info
      router.push('/skills'); // Redirect to the skills page
    }
  };

  const handleLogout = async () => {
    await signOut(auth); // Firebase sign out
    router.push('/'); // Redirect to the sign-in page (home)
  };

  return (
    <div>
      <h1>Enter Your Basic Information</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Gender:</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Program:</label>
          <input
            type="text"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default BasicInfo;
