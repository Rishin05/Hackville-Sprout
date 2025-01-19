"use client";

import { useState, useEffect } from "react";
import { database, auth } from "../../lib/firebase";
import { ref, get, set, onValue, off } from "firebase/database";
import { useRouter } from "next/navigation";

const AboutMe = () => {
  const [userData, setUserData] = useState<any>(null);
  const [skillsToTeach, setSkillsToTeach] = useState<string[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const router = useRouter();

  // Fetch current user's data from Realtime Database
  const fetchUserData = () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
          setSkillsToTeach(data.skillsToTeach || []);
          setSkillsToLearn(data.skillsToLearn || []);
        }
      });
    } else {
      router.push("/"); // Redirect to login if not authenticated
    }
  };

  // Fetch predefined skills list
  const fetchAllSkills = () => {
    setAllSkills([
      "ReactJS",
      "NodeJS",
      "JavaScript",
      "Python",
      "Java",
      "Cooking",
      "Photography",
      "Public Speaking",
      "Graphic Design",
      "Machine Learning",
    ]);
  };

  // Update skills to Realtime Database
  const updateSkills = () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      set(userRef, {
        ...userData,
        skillsToTeach,
        skillsToLearn,
      })
        .then(() => {
          alert("Skills updated successfully!");
          router.push("/main-page"); // Redirect after update
        })
        .catch((error) => {
          console.error("Error updating skills:", error);
        });
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAllSkills();

    // Cleanup when the component unmounts
    return () => {
      if (auth.currentUser) {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        off(userRef); // Unsubscribe from real-time listener
      }
    };
  }, []);

  return (
    <div>
      <h1>About Me</h1>
      {userData ? (
        <div style={styles.container}>
          <div style={styles.profilePictureContainer}>
            {userData.profilePicture ? (
              <img
                src={userData.profilePicture}
                alt="Profile Picture"
                style={styles.profilePicture as React.CSSProperties}
              />
            ) : (
              <div style={styles.defaultProfilePicture}></div>
            )}
          </div>

          <h2>{userData.name}</h2>
          <p>
            <strong>Program:</strong> {userData.program}
          </p>

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
    padding: "20px",
    maxWidth: "600px",
    margin: "auto",
  },
  profilePictureContainer: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    overflow: "hidden",
    marginBottom: "20px",
    backgroundColor: "#ccc",
  },
  profilePicture: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as "cover",
  },
  defaultProfilePicture: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  skillList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
  },
  skillItem: {
    display: "flex",
    alignItems: "center",
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AboutMe;
