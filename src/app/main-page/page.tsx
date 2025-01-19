"use client";

import { useEffect, useState } from "react";
import { auth, database } from "../../lib/firebase";
import { ref as dbRef, onValue, off } from "firebase/database";
import { useRouter } from "next/navigation";
import Chat from "../Chat/page"; // Import Chat component

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

  return (
    <div>

      <div className="flex gap-8 p-6 h-[calc(100vh-60px)] bg-[#FAFAFA]">
        <div className="flex-1 overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-4">Recommended Users We think you'd love to SKILL SWAP with:</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.length === 0 ? (
              <p>No compatible users found.</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-300 rounded-lg p-6 bg-gray-50 shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowChat(true);
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile Picture" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-2xl text-white">{user.name[0]}</div>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
                  <p><strong>Program:</strong> {user.program}</p>
                  <p><strong>Skills to Teach:</strong> {user.skills.join(", ")}</p>
                  <p><strong>Skills to Learn:</strong> {user.skillsToLearn.join(", ")}</p>
                  <p><strong>Matching Skills to Teach:</strong> {user.matchingSkillsToTeach.join(", ")}</p>
                  <p><strong>Matching Skills to Learn:</strong> {user.matchingSkillsToLearn.join(", ")}</p>
                  <button 
                    className="text-black bg-[#DBEC62] hover:bg-[#F8F27D] py-2 px-4 rounded-md w-full mt-4"
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
          <Chat 
            otherUserId={selectedUser.id}
            otherUserName={selectedUser.name}
            setShowChat={setShowChat} // Pass setShowChat to close the chat
          />
        )}
      </div>
    </div>
  );
};

export default MainPage;
