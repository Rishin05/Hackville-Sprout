"use client";

import { useState, useEffect } from "react";
import { database, auth } from "../../lib/firebase";
import { ref, onValue, off, set } from "firebase/database";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Define the UserData type
interface UserData {
  name: string;
  schoolEmail: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  education: string;
  personalityType: string;
  bio: string;
  skillsToTeach: string[];
  skillsToLearn: string[];
  profilePicture?: string;
}

const AboutMe = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    education: "",
    personalityType: "",
    bio: "",
    age: "",
  });
  const [skillsToTeach, setSkillsToTeach] = useState<string[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [isChanged, setIsChanged] = useState(false); // Track if any changes have occurred
  const router = useRouter();

  const allSkills = [
    // Academic skills
    "Academic Writing", "Research Methods", "Time Management", "Microsoft Excel", 
    "Python Programming", "Presentation Skills", "Note-Taking", "Data Analysis", 
    "Project Management", "Study Techniques",

    // Creative skills
    "Digital Drawing", "Photography", "Guitar Playing", "Dance (Hip-hop)", 
    "Watercolor Painting", "Basketball Skills", "Yoga Practice", "Skateboarding", 
    "Calligraphy", "Vocal Training",

    // Life skills
    "Meal Prep", "Personal Finance", "Room Organization", "Mental Wellness", 
    "Basic Car Maintenance", "Sustainable Living", "Public Speaking", 
    "Interview Skills", "Basic First Aid", "Time Management",

    // Language skills
    "Conversational English", "Business Japanese", "Academic Writing (Chinese)", 
    "Korean for Beginners", "Spanish Pronunciation", "French Culture & Language", 
    "German Grammar", "Italian Cooking Terms", "Travel Japanese", 
    "English Presentation Skills"
  ];

  const fetchUserData = () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            dateOfBirth: data.dateOfBirth || "",
            gender: data.gender || "",
            education: data.education || "",
            personalityType: data.personalityType || "",
            bio: data.bio || "",
            age: data.age || "",
          });
          setSkillsToTeach(data.skillsToTeach || []);
          setSkillsToLearn(data.skillsToLearn || []);
        }
      });
    } else {
      router.push("/"); // Redirect to home if no user
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsChanged(true); // Track changes
  };

  const updateProfile = async () => {
    const user = auth.currentUser;
    if (user && isChanged) {
      const userRef = ref(database, `users/${user.uid}`);
      try {
        await set(userRef, {
          ...formData,
          skillsToTeach,
          skillsToLearn,
        });
        alert("Profile updated successfully!");
        setIsChanged(false); // Reset change tracking
        router.push("/"); // Redirect to main page after save
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile");
      }
    } else {
      alert("No changes made or user not logged in.");
    }
  };

  useEffect(() => {
    fetchUserData();
    return () => {
      if (auth.currentUser) {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        off(userRef);
      }
    };
  }, []);

  const toggleSkill = ({ skill, type }: { skill: string; type: "teach" | "learn" }) => {
    if (type === "teach") {
      setSkillsToTeach(prev =>
        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      );
    } else {
      setSkillsToLearn(prev =>
        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      );
    }
    setIsChanged(true); // Track changes
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        {userData ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-[#C1E1A6] mb-3">
                    {userData.profilePicture ? (
                      <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-300" />
                    )}
                  </div>
                </div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold">{userData.name}</h2> {/* Display name below PFP */}
                </div>
                <div className="space-y-4">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="School Email"
                    className="w-full px-3 py-2 bg-[#C1E1A6] bg-opacity-30 rounded-md focus:outline-none"
                  />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#C1E1A6] bg-opacity-30 rounded-md focus:outline-none"
                  />
                  <input
                    type="text"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    placeholder="Gender"
                    className="w-full px-3 py-2 bg-[#C1E1A6] bg-opacity-30 rounded-md focus:outline-none"
                  />
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Age"
                    className="w-full px-3 py-2 bg-[#C1E1A6] bg-opacity-30 rounded-md focus:outline-none"
                  />
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="Education"
                    className="w-full px-3 py-2 bg-[#C1E1A6] bg-opacity-30 rounded-md focus:outline-none"
                  />
                  <input
                    type="text"
                    name="personalityType"
                    value={formData.personalityType}
                    onChange={handleInputChange}
                    placeholder="Personality Type"
                    className="w-full px-3 py-2 bg-[#C1E1A6] bg-opacity-30 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <textarea
                  value={formData.bio}
                  name="bio"
                  onChange={handleInputChange}
                  placeholder="Write something about yourself..."
                  className="w-full bg-[#FAFAFA] resize-none focus:outline-none min-h-[120px] mb-6 rounded "
                />
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Skills I Can Teach</h3>
                    <div className="flex flex-wrap gap-2">
                      {allSkills.map((skill, index) => (
                        <button
                          key={`${skill}-${index}`} // Ensure unique keys
                          onClick={() => toggleSkill({ skill, type: "teach" })}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                            ${skillsToTeach.includes(skill) ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Skills I Want to Learn</h3>
                    <div className="flex flex-wrap gap-2">
                      {allSkills.map((skill, index) => (
                        <button
                          key={`${skill}-${index}`} // Ensure unique keys
                          onClick={() => toggleSkill({ skill, type: "learn" })}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                            ${skillsToLearn.includes(skill) ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={updateProfile}
                className="bg-[#C1E1A6] hover:bg-[#aed18e] text-gray-800 px-6 py-2 rounded-full font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutMe;
