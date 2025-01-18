"use client";

import { useState, useEffect } from 'react';
import { auth, firestore } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';

const LearnSkills = () => {
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const router = useRouter();

  // Fetch skills that other users have selected
  const fetchSkills = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'users'));
      const skills = new Set<string>();

      // Loop through all users and gather all the skills
      querySnapshot.forEach((doc) => {
        const userSkills = doc.data().skills || [];
        userSkills.forEach((skill: string) => skills.add(skill));
      });

      setAvailableSkills(Array.from(skills)); // Convert Set to Array
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  // Handle skill selection
  const handleSkillChange = (skill: string) => {
    setSelectedSkills((prevSkills) =>
      prevSkills.includes(skill)
        ? prevSkills.filter((s) => s !== skill)
        : [...prevSkills, skill]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (auth.currentUser) {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await setDoc(
        userRef,
        { skillsToLearn: selectedSkills },
        { merge: true }
      );

      // Redirect to another page after submitting skills
      router.push('/main-page'); // Redirect to dashboard or another page
    }
  };

  useEffect(() => {
    fetchSkills(); // Fetch the available skills when the page loads
  }, []);

  return (
    <div>
      <h1>Select Skills You Want to Learn</h1>
      <form onSubmit={handleSubmit}>
        <div>
          {availableSkills.length === 0 ? (
            <p>No skills available. Make sure users have selected skills to teach.</p>
          ) : (
            availableSkills.map((skill) => (
              <div key={skill}>
                <input
                  type="checkbox"
                  id={skill}
                  value={skill}
                  checked={selectedSkills.includes(skill)}
                  onChange={() => handleSkillChange(skill)}
                  disabled={selectedSkills.length >= 3 && !selectedSkills.includes(skill)} // Limit to 3 skills
                />
                <label htmlFor={skill}>{skill}</label>
              </div>
            ))
          )}
        </div>
        <button type="submit" disabled={selectedSkills.length === 0}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default LearnSkills;