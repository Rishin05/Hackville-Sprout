"use client";

import { useState } from "react";
import { auth, database, storage } from "../../lib/firebase";
import { ref as dbRef, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

const BasicInfo = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [program, setProgram] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

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

        // If the user selected a profile picture, upload it
        if (profilePicture) {
          const storagePath = `profile_pictures/${auth.currentUser.uid}`;
          const fileRef = storageRef(storage, storagePath);
          await uploadBytes(fileRef, profilePicture);
          profilePictureURL = await getDownloadURL(fileRef);
        }

        // Save user data to Realtime Database
        const userRef = dbRef(database, `users/${auth.currentUser.uid}`);
        await set(userRef, {
          name,
          age,
          gender,
          program,
          profilePicture: profilePictureURL,
          createdAt: Date.now()
        });

        router.push("/skills");
      } catch (error) {
        console.error("Error uploading profile picture or saving user data:", error);
      }
    }

    setUploading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div>
      <h1>Enter Your Basic Information</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Gender:</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Program:</label>
          <input
            type="text"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Profile Picture:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Submit"}
        </button>
      </form>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default BasicInfo;