'use client';

import { useState } from 'react';
import { auth, database } from '../../lib/firebase';
import { ref as dbRef, update } from 'firebase/database';
import { useRouter } from 'next/navigation';

const SkillSelection = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const router = useRouter();

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

  const handleSkillChange = (skill: string) => {
    setSelectedSkills((prevSkills) =>
      prevSkills.includes(skill)
        ? prevSkills.filter((s) => s !== skill)
        : [...prevSkills, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (auth.currentUser) {
      const userRef = dbRef(database, `users/${auth.currentUser.uid}`);
      await update(userRef, {
        skills: selectedSkills,
        updatedAt: Date.now()
      });

      router.push('/learn');
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
