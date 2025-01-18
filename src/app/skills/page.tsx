"use client";

import { useState } from 'react';
import { auth, firestore } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const SkillSelection = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const router = useRouter();

  // List of skills to choose from
  const availableSkills = [
    'ReactJS',
    'NodeJS',
    'JavaScript',
    'Python',
    'Java',
    'Cooking',
    'Photography',
    'Public Speaking',
    'Graphic Design',
    'Machine Learning',
  ];

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
        { skills: selectedSkills },
        { merge: true }
      );

      // Redirect to another page after submitting skills
      router.push('/learn'); // Redirect to your dashboard or other page
    }
  };

  return (
    <div>
      <h1>Select Skills You Can Teach</h1>
      <form onSubmit={handleSubmit}>
        <div>
          {availableSkills.map((skill) => (
            <div key={skill}>
              <input
                type="checkbox"
                id={skill}
                value={skill}
                checked={selectedSkills.includes(skill)}
                onChange={() => handleSkillChange(skill)}
              />
              <label htmlFor={skill}>{skill}</label>
            </div>
          ))}
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SkillSelection;
