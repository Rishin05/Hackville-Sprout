'use client';

import { useState, useEffect } from 'react';
import { auth, database } from '../../lib/firebase';
import { ref as dbRef, get, set, update } from 'firebase/database';  // Corrected import
import { useRouter } from 'next/navigation';

const LearnSkills = () => {
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillsIAlreadyKnow, setSkillsIAlreadyKnow] = useState<string[]>([]);
  const router = useRouter();

  const fetchUserSkills = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = dbRef(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          setSkillsIAlreadyKnow(userData.skills || []);
        }
      }
    } catch (error) {
      console.error("Error fetching user skills:", error);
    }
  };

  const fetchSkills = async () => {
    try {
      const usersRef = dbRef(database, 'users');
      const usersSnapshot = await get(usersRef);
      const skills = new Set<string>();

      if (usersSnapshot.exists()) {
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          const userSkills = userData.skills || [];
          userSkills.forEach((skill: string) => skills.add(skill));
        });
      }

      const skillsArray = Array.from(skills).filter((skill) => !skillsIAlreadyKnow.includes(skill));
      setAvailableSkills(skillsArray);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

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
        skillsToLearn: selectedSkills,
        updatedAt: Date.now()
      });

      router.push('/main-page');
    }
  };

  useEffect(() => {
    fetchUserSkills();
  }, []);

  useEffect(() => {
    if (skillsIAlreadyKnow.length > 0) {
      fetchSkills();
    }
  }, [skillsIAlreadyKnow]);

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
