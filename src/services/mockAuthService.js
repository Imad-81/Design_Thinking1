// TODO: replace with real backend

const STORAGE_KEY_USERS = "campusTasks_users";
const STORAGE_KEY_CURRENT_USER = "campusTasks_currentUser";

/**
 * Get all users from localStorage
 */
function getUsers() {
  const usersJson = localStorage.getItem(STORAGE_KEY_USERS);
  return usersJson ? JSON.parse(usersJson) : [];
}

/**
 * Save users to localStorage
 */
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

/**
 * Sign up a new user
 * @param {Object} userData - { name, email, password }
 * @returns {Object} { success: boolean, user?: Object, error?: string }
 */
export function signup({ name, email, password }) {
  // Validate inputs
  if (!name || !email || !password) {
    return { success: false, error: "All fields are required" };
  }

  // Validate name (alphabets + spaces only)
  if (!/^[A-Za-z ]+$/.test(name.trim())) {
    return { success: false, error: "Name must contain only letters and spaces" };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Invalid email format" };
  }

  // Validate password length
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  const users = getUsers();

  // Check if email already exists
  const existingUser = users.find((u) => u.email === email.toLowerCase());
  if (existingUser) {
    return { success: false, error: "Email already registered" };
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.toLowerCase(),
    password: password, // In real app, this would be hashed
    bio: "", // Default empty bio
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Auto-login after signup
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

/**
 * Log in a user
 * @param {Object} credentials - { email, password }
 * @returns {Object} { success: boolean, user?: Object, error?: string }
 */
export function login({ email, password }) {
  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const users = getUsers();
  const user = users.find(
    (u) => u.email === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  // Set current user
  setCurrentUser(user);

  return { success: true, user };
}

/**
 * Log out the current user
 */
export function logout() {
  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
}

/**
 * Get the currently logged-in user
 * @returns {Object|null}
 */
export function getCurrentUser() {
  const userJson = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  const user = userJson ? JSON.parse(userJson) : null;
  // Ensure bio field exists for backward compatibility
  if (user && user.bio === undefined) {
    user.bio = "";
  }
  return user;
}

/**
 * Update user bio
 * @param {string} userId
 * @param {string} bio
 */
export function updateUserBio(userId, bio) {
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].bio = bio;
    saveUsers(users);
    
    // Update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.bio = bio;
      const { password, ...userWithoutPassword } = currentUser;
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userWithoutPassword));
    }
  }
}

/**
 * Set the current user in localStorage
 * @param {Object} user
 */
function setCurrentUser(user) {
  // Don't store password in current user object
  const { password, ...userWithoutPassword } = user;
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userWithoutPassword));
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

