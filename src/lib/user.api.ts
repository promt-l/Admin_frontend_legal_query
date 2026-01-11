import api from "../config/api";

/* ---------------- TYPES ---------------- */

export type User = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  lastActive?: string;
  queriesCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

/* ---------------- API FUNCTIONS ---------------- */

// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>("/user");
  return data;
};

// Fetch single user
export const fetchUser = async (id: string): Promise<User> => {
  const { data } = await api.get<User>(`/user/${id}`);
  return data;
};

// Create user
export const createUser = async (
  user: Omit<User, "_id">
): Promise<User> => {
  const { data } = await api.post<User>("/user", user);
  return data;
};

// Update user
export const updateUser = async (
  id: string,
  user: Partial<User>
): Promise<User> => {
  const { data } = await api.put<User>(`/user/${id}`, user);
  return data;
};

// Delete user
export const deleteUser = async (
  id: string
): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`/user/${id}`);
  return data;
};
