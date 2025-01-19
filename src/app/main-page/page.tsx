"use client";

import { useEffect, useState } from "react";
import { auth, database } from "../../lib/firebase";
import { ref as dbRef, onValue, off } from "firebase/database";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Chat from "../Chat/page";

interface User {
  id: string;
  name: string;
  program: string;
  skills: string[];
  skillsToLearn: string[];
  profilePicture?: string;
  matchingSkillsToTeach: string[];
  matchingSkillsToLearn: string[];
  totalMatchingSkills: number;
}

const MainPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/');
      return;
    }

    // Subscribe to current user's data
    const currentUserRef = dbRef(database, `users/${auth.currentUser.uid}`);
    onValue(currentUserRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentUser({ id: snapshot.key, ...snapshot.val() });
      }
    });

    // Subscribe to all users
    const usersRef = dbRef(database, 'users');
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists() && currentUser) {
        const usersData: User[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          const userId = childSnapshot.key;

          if (userId !== auth.currentUser?.uid) {
            // Calculate matching skills
            const matchingSkillsToTeach = (currentUser.skillsToLearn || [])
              .filter((skill: string) => userData.skills?.includes(skill));
            
            const matchingSkillsToLearn = (currentUser.skills || [])
              .filter((skill: string) => userData.skillsToLearn?.includes(skill));

            const totalMatchingSkills = matchingSkillsToTeach.length + matchingSkillsToLearn.length;

            if (totalMatchingSkills > 0) {
              usersData.push({
                id: userId,
                name: userData.name,
                program: userData.program,
                skills: userData.skills || [],
                skillsToLearn: userData.skillsToLearn || [],
                profilePicture: userData.profilePicture,
                matchingSkillsToTeach,
                matchingSkillsToLearn,
                totalMatchingSkills,
              });
            }
          }
        });

        // Sort users by number of matching skills
        usersData.sort((a, b) => b.totalMatchingSkills - a.totalMatchingSkills);
        setUsers(usersData);
      }
    });

    // Cleanup subscriptions
    return () => {
      off(currentUserRef);
      off(usersRef);
    };
  }, [currentUser?.skillsToLearn, currentUser?.skills]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div>
      <nav style={styles.navbar}>
        <button onClick={() => router.push("/main-page")} style={styles.navButton}>
          Home
        </button>
        <button onClick={() => router.push("/about")} style={styles.navButton}>
          About Me
        </button>
        <button onClick={handleLogout} style={styles.navButton}>
          Logout
        </button>
      </nav>

      <div style={styles.contentContainer}>
        <div style={styles.userListContainer}>
          <h1>Compatible Users</h1>
          <div style={styles.userList}>
            {users.length === 0 ? (
              <p>No compatible users found.</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  style={styles.userCard}
                  onClick={() => {
                    setSelectedUser(user);
                    setShowChat(true);
                  }}
                >
                  <div style={styles.profilePictureContainer}>
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile Picture"
                        style={styles.profileImage}
                      />
                    ) : (
                      <div style={styles.defaultProfilePicture}>
                        {user.name[0]}
                      </div>
                    )}
                  </div>
                  <h2>{user.name}</h2>
                  <p><strong>Program:</strong> {user.program}</p>
                  <p><strong>Skills to Teach:</strong> {user.skills.join(", ")}</p>
                  <p><strong>Skills to Learn:</strong> {user.skillsToLearn.join(", ")}</p>
                  <p><strong>Matching Skills to Teach:</strong> {user.matchingSkillsToTeach.join(", ")}</p>
                  <p><strong>Matching Skills to Learn:</strong> {user.matchingSkillsToLearn.join(", ")}</p>
                  <button 
                    style={styles.chatButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                      setShowChat(true);
                    }}
                  >
                    Chat with {user.name}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {showChat && selectedUser && (
          <div style={styles.chatContainer}>
            <div style={styles.chatHeader}>
              <h2>Chat with {selectedUser.name}</h2>
              <button 
                onClick={() => setShowChat(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <Chat 
              otherUserId={selectedUser.id}
              otherUserName={selectedUser.name}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  contentContainer: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    height: 'calc(100vh - 60px)',
  },
  userListContainer: {
    flex: '1 1 auto',
    overflowY: 'auto' as const,
  },
  chatContainer: {
    flex: '0 0 400px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  chatHeader: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0 10px',
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#333",
    color: "#fff",
  },
  navButton: {
    backgroundColor: "#555",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "14px",
  },
  userList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    padding: "20px",
  },
  userCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.2s",
    '&:hover': {
      transform: "translateY(-2px)",
    },
  },
  profilePictureContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    overflow: "hidden",
    marginBottom: "15px",
    backgroundColor: "#ccc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  defaultProfilePicture: {
    width: "100%",
    height: "100%",
    backgroundColor: "#555",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontSize: "24px",
    fontWeight: "bold",
  },
  chatButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "8px 16px",
    marginTop: "10px",
    cursor: "pointer",
    width: "100%",
    '&:hover': {
      backgroundColor: "#0056b3",
    },
  },
};

export default MainPage;