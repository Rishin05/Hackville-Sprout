"use client";

import { useState } from "react";
import { auth, database } from "../../lib/firebase";
import { ref as dbRef, update } from "firebase/database";
import { useRouter } from "next/navigation";

const categories: { [key: string]: string[] } = {
  "Work & Study": [
    "Academic Writing",
    "Research Methods",
    "Time Management",
    "Microsoft Excel",
    "Python Programming",
    "Presentation Skills",
    "Note-Taking",
    "Data Analysis",
    "Project Management",
    "Study Techniques",
  ],
  "Sports & Art": [
    "Digital Drawing",
    "Photography",
    "Guitar Playing",
    "Dance (Hip-hop)",
    "Watercolor Painting",
    "Basketball Skills",
    "Yoga Practice",
    "Skateboarding",
    "Calligraphy",
    "Vocal Training",
  ],
  "Life Skills": [
    "Meal Prep",
    "Personal Finance",
    "Room Organization",
    "Mental Wellness",
    "Basic Car Maintenance",
    "Sustainable Living",
    "Public Speaking",
    "Interview Skills",
    "Basic First Aid",
    "Time Management",
  ],
  "Language": [
    "Conversational English",
    "Business Japanese",
    "Academic Writing (Chinese)",
    "Korean for Beginners",
    "Spanish Pronunciation",
    "French Culture & Language",
    "German Grammar",
    "Italian Cooking Terms",
    "Travel Japanese",
    "English Presentation Skills",
  ],
};

const SkillSelection = () => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof categories | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [apples, setApples] = useState<{ skill: string; x: number; y: number }[]>([]);
  const router = useRouter();

  const handleSkillChange = (skill: string) => {
    setSelectedSkills((prevSkills) =>
      prevSkills.includes(skill)
        ? prevSkills.filter((s) => s !== skill)
        : [...prevSkills, skill]
    );

    const existingApple = apples.find((apple) => apple.skill === skill);
    
    if (!existingApple) {
      const randomX = Math.random() * 60 + 20; // Random x position (20% to 80% of width)
      const randomY = Math.random() * 30 + 10; // Random y position (10% to 40% of height)

      setApples((prev) => [
        ...prev,
        { skill, x: randomX, y: randomY },
      ]);
    } else {
      setApples((prev) => prev.filter((apple) => apple.skill !== skill));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (auth.currentUser) {
      const userRef = dbRef(database, `users/${auth.currentUser.uid}`);
      await update(userRef, {
        skills: selectedSkills,
        updatedAt: Date.now(),
      });

      router.push('/learn'); // Update '/learn' with your actual next page URL
    }
  };

  // Calculate the progress dynamically based on the number of selected skills
  let progressPercentage = 33; // Starting value
  if (selectedSkills.length === 1) {
    progressPercentage = 48; // After selecting the first skill
  } else if (selectedSkills.length >= 2) {
    progressPercentage = 66; // After selecting two skills
  }

  return (
    <div className="min-h-[80vh] bg-gray-100 flex flex-col items-center p-6">
      {/* Main Container */}
      <div className="bg-white rounded-lg shadow-lg p-8 mt-6 w-full max-w-6xl flex flex-col relative">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-300 rounded-md mb-6 overflow-hidden">
          <div
            className="h-2 rounded-md transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: '#F2B13E',
            }}
          ></div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-8">What's Your Talent?</h2>

        {/* Main content */}
        <div className="flex mb-8">
          {/* Left side: Tree image */}
          <div className="w-1/2 flex justify-center items-center relative">
            <img
              className="w-full max-w-md"
              src="./tree3.png" // Update this with the actual image path
              alt="Tree"
            />

            {/* Apples (skills) that pop up on the tree */}
            {apples.map((apple) => (
              <div
                key={apple.skill}
                className="absolute animate-apple-appear"
                style={{
                  left: `${apple.x}%`,
                  top: `${apple.y}%`,
                }}
              >
                <img
                  src="./apple2.png" // Replace with the path to your apple image
                  alt="Apple"
                  className="w-8 h-8 filter" // Adjust size of the apple image
                />
              </div>
            ))}
          </div>

          {/* Right side: Category and Skill selection */}
          <div className="w-1/2 p-8">
            {/* Category Dropdown */}
            <div className="mb-6">
              <select
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md w-full"
                defaultValue=""
              >
                <option value="" disabled>Select a Category</option>
                {Object.keys(categories).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {selectedCategory &&
                categories[selectedCategory].map((skill) => (
                  <div key={skill} className="flex items-center mb-4">
                    <button
                      type="button"
                      onClick={() => handleSkillChange(skill)}
                      className={`px-6 py-2 rounded-lg border-2 border-gray-300 hover:bg-[#DBEC62] hover:text-black transition-all duration-300 ${selectedSkills.includes(skill) ? 'bg-[#DBEC62] text-black' : ''}`}
                    >
                      {skill}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleSubmit}
          className="bg-[#DBEC62] text-black font-bold py-3 px-6 rounded-lg hover:bg-[#F2B13E] self-end"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SkillSelection;
