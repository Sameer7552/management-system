import React, { useEffect, useState } from "react";
import { db } from "./firebaseConfig"; // Import Firestore
import { collection, getDocs, addDoc, doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore methods
import { auth } from "./firebaseConfig"; // Ensure auth is imported
import { useAuthState } from "react-firebase-hooks/auth"; // Ensure this import is correct
import Swal from "sweetalert2"; // Import SweetAlert2

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]); // State to store teams
  const [user] = useAuthState(auth); // Get the currently logged-in user
  const [currentUserName, setCurrentUserName] = useState(""); // State for current user's name
  const [teamName, setTeamName] = useState("");
  const [teamType, setTeamType] = useState("Development");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null); // State for the selected team
  const [messages, setMessages] = useState([]); // State for chat messages
  const [newMessage, setNewMessage] = useState(""); // State for new message input

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const userDocs = await getDocs(usersCollection);
      const allUsers = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filteredUsers = allUsers.filter(u => u.email !== user.email);
      setUsers(filteredUsers);
    };

    const fetchCurrentUserName = async () => {
      if (!user) return; // Ensure user is logged in
    
      const userDocRef = doc(db, "users", user.uid); // Reference the current user's document
      const userDoc = await getDoc(userDocRef); // Fetch the user document
    
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Fetched User Data:", userData); // Debugging: Log the user data
        setCurrentUserName(userData.name); // Set the user's name
      } else {
        console.error("No such user document!");
      }
    };
    

    const fetchTeams = async () => {
      const teamsCollection = collection(db, "teams");
      const teamDocs = await getDocs(teamsCollection);
      const allTeams = teamDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(allTeams);
    };

    if (user) {
      fetchUsers();
      fetchCurrentUserName();
      fetchTeams();
    }
  }, [user]);

  const handleCreateTeam = async () => {
    if (teamName.trim() === "" || selectedUsers.length === 0) {
      Swal.fire("Error", "Please enter a team name and select users.", "error");
      return;
    }

    try {
      const teamRef = await addDoc(collection(db, "teams"), {
        name: teamName,
        type: teamType,
        members: selectedUsers,
        messages: [], // Initialize with an empty messages array
      });

      // Update local state with the new team
      const newTeam = { id: teamRef.id, name: teamName, type: teamType, members: selectedUsers, messages: [] };
      setTeams(prevTeams => [...prevTeams, newTeam]); // Add the new team to the teams state

      Swal.fire("Success", "Team created successfully!", "success"); // Success alert
      setTeamName("");
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error creating team: ", error); // Log the error to the console
      Swal.fire("Error", "Failed to create team: " + error.message, "error"); // Error alert
    }
  };

  const handleTeamSelect = async (team) => {
    setSelectedTeam(team);
    // Fetch messages from the selected team
    setMessages(team.messages || []);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") {
      Swal.fire("Error", "Please enter a message.", "error"); // Error alert for empty message
      return;
    }

    const updatedMessages = [
      ...messages,
      { user: currentUserName || user.email, text: newMessage },
    ];

    try {
      // Update team messages in Firestore
      await updateDoc(doc(db, "teams", selectedTeam.id), {
        messages: updatedMessages,
      });
      setMessages(updatedMessages); // Update local messages state
      setNewMessage(""); // Clear the input field
      Swal.fire("Success", "Message sent successfully!", "success"); // Success alert for sent message
    } catch (error) {
      console.error("Error sending message: ", error);
      Swal.fire("Error", "Failed to send message.", "error"); // Error alert for failed message
    }
  };

  return (
    <div className="flex p-8 bg-gradient-to-r from-blue-200 to-purple-200 min-h-screen">
      <div className="flex-1 bg-white rounded-lg shadow-lg p-6 mr-4">
        <header className="mb-6">
          <h2 className="text-4xl font-bold mb-2 animate-bounce text-purple-600">Dashboard</h2>
          <p className="text-2xl font-bold">Welcome, {user.name || user.email}!</p>
        </header>

        <h3 className="text-2xl font-semibold mb-2 text-purple-800">All Users</h3>
        <ul className="list-disc mb-4">
          {users.map(user => (
            <li key={user.id} className="hover:bg-purple-100 transition duration-200 p-2 rounded font-bold">
              {user.name} - {user.email}
            </li>
          ))}
        </ul>

        <h3 className="text-2xl font-semibold mb-2 text-purple-800">Create Team</h3>
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="border border-gray-300 p-2 mb-2 rounded w-full focus:outline-none focus:ring focus:ring-purple-300"
        />
        <select
          value={teamType}
          onChange={(e) => setTeamType(e.target.value)}
          className="border border-gray-300 p-2 mb-2 rounded w-full focus:outline-none focus:ring focus:ring-purple-300"
        >
          <option value="Development">Development</option>
          <option value="Project Management">Project Management</option>
          <option value="Quality Assurance">Quality Assurance</option>
          <option value="User Experience (UX) Design">User Experience (UX) Design</option>
          <option value="DevOps">DevOps</option>
          <option value="Database Administration">Database Administration</option>
          <option value="System Architecture">System Architecture</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Sales and Marketing">Sales and Marketing</option>
          <option value="Human Resources (HR)">Human Resources (HR)</option>
          <option value="Research and Development (R&D)">Research and Development (R&D)</option>
          <option value="Cybersecurity Team">Cybersecurity Team</option>
        </select>

        <h4 className="font-semibold text-purple-800 mb-2">Select Users for Team:</h4>
        <ul className="mb-4">
          {users.map(user => (
            <li key={user.id} className="flex items-center mb-2 hover:bg-purple-100 transition duration-200 p-2 rounded">
              <input
                type="checkbox"
                value={user.id}
                checked={selectedUsers.includes(user.id)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (selectedUsers.includes(value)) {
                    setSelectedUsers(selectedUsers.filter(id => id !== value));
                  } else {
                    setSelectedUsers([...selectedUsers, value]);
                  }
                }}
                className="form-checkbox h-5 w-5 text-purple-600"
              />
              <label className="ml-2">{user.name}</label>
            </li>
          ))}
        </ul>
        <button
          onClick={handleCreateTeam}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-200 w-full"
        >
          Create Team
        </button>
      </div>

      <div className="w-1/3 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-semibold mb-2 text-purple-800">My Teams</h3>
        <ul className="list-disc mb-4">
          {teams.map(team => (
            <li key={team.id} className="hover:bg-purple-100 transition duration-200 p-2 rounded">
              <button
                onClick={() => handleTeamSelect(team)}
                className="font-bold text-left w-full"
              >
                {team.name}
              </button>
            </li>
          ))}
        </ul>

        {selectedTeam && (
          <>
            <h4 className="text-xl font-semibold mb-2">Chat with {selectedTeam.name}</h4>
            <div className="border rounded-lg p-4 mb-4 h-60 overflow-y-scroll">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.user === currentUserName ? "text-blue-600" : "text-gray-800"}`}>
                  <strong>{msg.user}: </strong>
                  {msg.text}
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type your message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-purple-300"
            />
            <button
              onClick={handleSendMessage}
              className="bg-green-500 text-white p-3 rounded hover:bg-green-600 transition duration-200 w-full mt-2"
            >
              Send Message
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
