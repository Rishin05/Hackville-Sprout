"use client";

import { useState, useEffect } from 'react';
import { firestore, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const AboutMe = () => {
  const [userData, setUserData] = useState<any>(null); // Store user data
  const [skillsToTeach, setSkillsToTeach] = useState<string[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]); // Predefined list of skills
  const router = useRouter();

  // Fetch current user's data
  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setSkillsToTeach(data.skills || []);
          setSkillsToLearn(data.skillsToLearn || []);
        }
      } else {
        router.push('/'); // Redirect to login if not authenticated
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch predefined skills list (mock or from a database)
  const fetchAllSkills = () => {
    setAllSkills(['JavaScript', 'Python', 'React', 'Design', 'Marketing', 'Writing', 'Leadership']);
  };

  // Handle skill updates
  const updateSkills = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(
          userRef,
          {
            skills: skillsToTeach,
            skillsToLearn: skillsToLearn,
          },
          { merge: true }
        );
        alert('Skills updated successfully!');
        router.push('/main-page'); // Redirect to the main page after updating
      }
    } catch (error) {
      console.error('Error updating skills:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAllSkills();
  }, []);

  return (
    <div>
      <h1>About Me</h1>
      {userData ? (
        <div style={styles.container}>
          <h2>{userData.name}</h2>
          <p><strong>Program:</strong> {userData.program}</p>

          {/* Skills to Teach */}
          <div>
            <h3>Skills I Can Teach</h3>
            <div style={styles.skillList}>
              {allSkills.map((skill) => (
                <div key={skill} style={styles.skillItem}>
                  <input
                    type="checkbox"
                    checked={skillsToTeach.includes(skill)}
                    onChange={() =>
                      setSkillsToTeach((prev) =>
                        prev.includes(skill)
                          ? prev.filter((s) => s !== skill)
                          : [...prev, skill]
                      )
                    }
                  />
                  <label>{skill}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Skills to Learn */}
          <div>
            <h3>Skills I Want to Learn</h3>
            <div style={styles.skillList}>
              {allSkills.map((skill) => (
                <div key={skill} style={styles.skillItem}>
                  <input
                    type="checkbox"
                    checked={skillsToLearn.includes(skill)}
                    onChange={() =>
                      setSkillsToLearn((prev) =>
                        prev.includes(skill)
                          ? prev.filter((s) => s !== skill)
                          : [...prev, skill]
                      )
                    }
                  />
                  <label>{skill}</label>
                </div>
              ))}
            </div>
          </div>

          <button onClick={updateSkills} style={styles.saveButton}>
            Save Changes
          </button>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: 'auto',
  },
  skillList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
  },
  skillItem: {
    display: 'flex',
    alignItems: 'center',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default AboutMe;
