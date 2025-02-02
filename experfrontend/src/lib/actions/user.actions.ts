
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
export async function loginUser(email: string, password: string, rememberMe: boolean) {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', { // fetch user data from API
      method: 'POST',
      credentials: 'include', // Send cookies with request
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    // Check for errors in response
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();

    // Store user data in local storage / sessionStorage if rememberMe is true
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Logout user by removing user data from local storage / sessionStorage
export async function logoutUser() {
  try {
    const response = await fetch('http://localhost:8080/api/auth/logout', {
      method: 'POST',
      credentials: 'include',  // Include cookies in the request
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    // Clear local storage regardless of server response
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');

    return await response.json();
  } catch (error) {
    console.error('Error logging out:', error);
    // Still clear local storage even if server request fails
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    throw error;
  }
}