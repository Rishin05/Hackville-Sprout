"use client";

import { useState } from "react";
import { auth, database, storage } from "../../lib/firebase";
import { ref as dbRef, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import Navbar from "../components/navbar"; // Import the Navbar component

const BasicInfo = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [program, setProgram] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const totalFields = 6; // Total number of input fields on this page

  const getCompletedFieldsCount = () => {
    let completed = 0;
    if (name.trim() !== "") completed++;
    if (age.trim() !== "") completed++;
    if (gender.trim() !== "") completed++;
    if (program.trim() !== "") completed++;
    if (email.trim() !== "") completed++;
    if (phone.trim() !== "") completed++;
    return completed;
  };

  // Calculate percentage for progress bar based on completed fields
  const progressPercentage = () => {
    const completed = getCompletedFieldsCount();
    const percentage = (completed / totalFields) * 100;
    // Constrain the progress bar between 0 and 33%
    return Math.min(percentage, 33);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    if (auth.currentUser) {
      try {
        let profilePictureURL = "";

        if (profilePicture) {
          const storagePath = `profile_pictures/${auth.currentUser.uid}`;
          const fileRef = storageRef(storage, storagePath);
          await uploadBytes(fileRef, profilePicture);
          profilePictureURL = await getDownloadURL(fileRef);
        }

        const userRef = dbRef(database, `users/${auth.currentUser.uid}`);
        await set(userRef, {
          name,
          age,
          gender,
          program,
          email,
          phone,
          profilePicture: profilePictureURL,
          createdAt: Date.now(),
        });

        // Navigate to the next page
        router.push("/skills"); // Update this to your actual skill selection page path
      } catch (error) {
        console.error("Error uploading profile picture or saving user data:", error);
      }
    }

    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">

      {/* Main Container */}
      <div className="bg-white rounded-lg shadow-lg p-8 mt-6 w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-300 rounded-md mb-6 overflow-hidden">
          <div
            className="h-2 rounded-md transition-all duration-300"
            style={{
              width: `${progressPercentage()}%`,
              backgroundColor: "#F2B13E",
            }}
          ></div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-8">Tell us about you!</h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-8">
            {/* Column 1 */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F2B13E]"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">Age:</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F2B13E]"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">Gender:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F2B13E]"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">Program:</label>
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                required
                className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F2B13E]"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F2B13E]"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">Phone:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F2B13E]"
              />
            </div>
            <div className="flex flex-col col-span-2">
              <label className="text-sm font-semibold mb-2">Profile Picture:</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F2B13E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="mt-6 bg-[#DBEC62] text-black font-bold py-3 px-6 rounded-lg float-right"
          >
            {uploading ? "Uploading..." : "Next"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BasicInfo;
