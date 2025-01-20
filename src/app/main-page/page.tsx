"use client";

import { useEffect, useState } from "react";
import { auth, database } from "../../lib/firebase";
import { ref as dbRef, onValue, off } from "firebase/database";
import { useRouter } from "next/navigation";
import Chat from "../Chat/page"; // Import Chat component

interface User {
  id: string;
  name: string;
  education: string;
  skillsToTeach: string[];
  skillsToLearn: string[];
  matchingSkillsToTeach: string[];
  totalMatchingSkills: number;
  profilePicture: string;
}

const categorizeUsersBySkill = (users: User[], skill: string) => {
  return users.filter((user) => user.skillsToTeach.includes(skill));
};

const MainPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/");
      return;
    }

    const currentUserRef = dbRef(database, `users/${auth.currentUser.uid}`);
    const unsubscribeCurrentUser = onValue(currentUserRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setCurrentUser({ id: snapshot.key, ...userData });

        // Extract unique categories from skillsToLearn
        const uniqueCategories: string[] = Array.from(
          new Set(userData.skillsToLearn || [])
        );
        setCategories(uniqueCategories);
      }
    });

    const usersRef = dbRef(database, "users");
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData: User[] = [];
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          const userId = childSnapshot.key;
          if (userId !== auth.currentUser?.uid) {
            const matchingSkillsToTeach = (currentUser?.skillsToLearn || []).filter((skill: string) =>
              userData.skillsToTeach?.includes(skill)
            );
            const totalMatchingSkills = matchingSkillsToTeach.length;
            if (totalMatchingSkills > 0) {
              usersData.push({
                id: userId,
                name: userData.name,
                education: userData.education,
                skillsToTeach: userData.skillsToTeach || [],
                skillsToLearn: userData.skillsToLearn || [],
                matchingSkillsToTeach,
                totalMatchingSkills,
                profilePicture: userData.profilePicture || "",
              });
            }
          }
        });
        usersData.sort((a, b) => b.totalMatchingSkills - a.totalMatchingSkills);
        setUsers(usersData);
      }
    });

    return () => {
      off(currentUserRef);
      off(usersRef);
    };
  }, [currentUser?.skillsToLearn, router]);

  return (
    <div className="bg-[#262D21] min-h-screen overflow-y-auto p-6">
      <div className="flex gap-8 min-h-[calc(100vh-60px)]">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-6 text-white">Your TOP Matches</h1>

          {categories.map((category) => {
            const categoryUsers = categorizeUsersBySkill(users, category);
            if (categoryUsers.length === 0) {
              return null;
            }
            return (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-white">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryUsers.map((user) => (
                    <div
                      key={user.id}
                      className="border border-gray-300 rounded-lg bg-gray-50 shadow-lg cursor-pointer hover:scale-105 transition-transform p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={user.profilePicture || "/default-avatar.png"}
                          alt={`${user.name}'s profile`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <h2 className="text-xl font-semibold">{user.name}</h2>
                          <p><strong>Program:</strong> {user.education}</p>
                        </div>
                      </div>
                      <div>
                        <p><strong>Skills to Teach:</strong> {user.skillsToTeach.join(", ")}</p>
                        <p><strong>Skills to Learn:</strong> {user.skillsToLearn.join(", ")}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowChat(true);
                        }}
                        className="mt-4 bg-[#DBEC62] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#F2B13E]"
                      >
                        Chat with Me
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {showChat && selectedUser && (
          <Chat
            otherUserId={selectedUser.id}
            otherUserName={selectedUser.name}
            setShowChat={setShowChat}
          />
        )}
      </div>
    </div>
  );
};

export default MainPage;
