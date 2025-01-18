"use client";

import { useEffect, useState } from 'react';
import { firestore, auth } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const MainPage = () => {
  const [users, setUsers] = useState<any[]>([]); // Store users' data
  const router = useRouter(); // Initialize useRouter

  // Fetch all users' data from Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'users'));
      const usersData: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData) {
          usersData.push({
            id: doc.id,
            name: userData.name,
            program: userData.program,
            skillsToTeach: userData.skills || [],
            skillsToLearn: userData.skillsToLearn || []
          });
        }
      });

      setUsers(usersData); // Update the state with the fetched data
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to login page after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Navigate to different pages
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    fetchUsers(); // Fetch users when the page loads
  }, []);

  return (
    <div>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <button onClick={() => handleNavigate('/main-page')} style={styles.navButton}>Home</button>
        <button onClick={() => handleNavigate('/about')} style={styles.navButton}>About Me</button>
        <button onClick={handleLogout} style={styles.navButton}>Logout</button>
      </nav>

      <h1>All Users</h1>
      <div style={styles.userList}>
        {users.length === 0 ? (
          <p>No users found. Please make sure there are users in the database.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} style={styles.userCard}>
              <h2>{user.name}</h2>
              <p><strong>Program:</strong> {user.program}</p>
              <p><strong>Skills to Teach:</strong> {user.skillsToTeach.join(', ')}</p>
              <p><strong>Skills to Learn:</strong> {user.skillsToLearn.join(', ')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Basic styling for navigation bar, cards, and layout
const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#333',
    color: '#fff',
  },
  navButton: {
    backgroundColor: '#555',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  navButtonHover: {
    backgroundColor: '#777',
  },
  userList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
  userCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
};

export default MainPage;
