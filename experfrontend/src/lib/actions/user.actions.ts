
// Interface for user data
interface UserData { 
  email: string;
  username: string;
  firstName: string; 
  lastName: string;
  password: string;
  imageUrl?: string;
}

// Create new user account with provided data and accessing backend user service
export async function createUser(userData: UserData) {
  try {
    const response = await fetch('http://localhost:8080/api/auth/register', { // fetch user data from API
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    // Check for errors in response
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Login user with provided email and password
export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', { // fetch user data from API
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Check for errors in response
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}