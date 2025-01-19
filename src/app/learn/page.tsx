"use client";

import { useState, useEffect } from "react";
import { auth, database } from "../../lib/firebase";
import { ref as dbRef, get, update } from "firebase/database";
import { useRouter } from "next/navigation";

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

  const fetchAvailableSkills = async () => {
    try {
      const usersRef = dbRef(database, "users");
      const usersSnapshot = await get(usersRef);
      const skillsOffered = new Set<string>();

      if (usersSnapshot.exists()) {
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          const userSkillsToTeach = userData.skills || [];
          userSkillsToTeach.forEach((skill: string) => skillsOffered.add(skill));
        });
      }

      const filteredSkills = Array.from(skillsOffered).filter(
        (skill) => !skillsIAlreadyKnow.includes(skill)
      );

      setAvailableSkills(filteredSkills);
    } catch (error) {
      console.error("Error fetching available skills:", error);
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
        updatedAt: Date.now(),
      });

      router.push("/main-page"); // Replace with the actual path of your main page
    }
  };

  useEffect(() => {
    fetchUserSkills();
  }, []);

  useEffect(() => {
    if (skillsIAlreadyKnow.length > 0) {
      fetchAvailableSkills();
    }
  }, [skillsIAlreadyKnow]);

  // Calculate the progress dynamically based on the number of selected skills
  let progressPercentage = 66; // Starting value
  if (selectedSkills.length === 1) {
    progressPercentage = 83; // After selecting the first skill
  } else if (selectedSkills.length >= 2) {
    progressPercentage = 100; // After selecting two or more skills
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Main Container */}
      <div className="bg-white rounded-lg shadow-lg p-8 mt-6 w-full max-w-6xl flex flex-col relative">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-300 rounded-md mb-6 overflow-hidden">
          <div
            className="h-2 rounded-md transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: "#F2B13E",
            }}
          ></div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-8">What Are You Looking For?</h2>

        {/* Main content */}
        <div className="flex mb-8">
          {/* Left side: Tree GIF */}
          <div className="w-1/2 flex justify-center items-center relative">
            <img
              className="w-full max-w-md"
              src="./tree.gif" // Replace with your actual tree GIF path
              alt="Tree"
            />
          </div>

          {/* Right side: Skill selection */}
          <div className="w-1/2 p-8">
            <div className="grid grid-cols-2 gap-4">
              {availableSkills.length === 0 ? (
                <p>No skills available. Make sure users have selected skills to teach.</p>
              ) : (
                availableSkills.map((skill) => (
                  <div key={skill} className="flex items-center mb-4">
                    <button
                      type="button"
                      onClick={() => handleSkillChange(skill)}
                      className={`px-6 py-2 rounded-lg border-2 border-gray-300 hover:bg-[#DBEC62] hover:text-black transition-all duration-300 ${selectedSkills.includes(skill) ? "bg-[#DBEC62] text-black" : ""}`}
                    >
                      {skill}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="bg-[#DBEC62] text-black font-bold py-3 px-6 rounded-lg hover:bg-[#F2B13E] self-end"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default LearnSkills;
