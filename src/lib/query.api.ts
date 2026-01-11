import api from "../config/api";

export type QueryStatus = "pending" | "in progress" | "answered" | "closed";
export type QueryUrgency = "Low" | "Medium" | "High" | "Critical";
export type QueryCategory =
  | "Legal aid"
  | "startup"
  | "ADR"
  | "property dispute"
  | "miscellaneous";

export interface FileMetadata {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

export interface Query {
  _id: string;
  fullName: string;
  email: string;
  phone: number;
  location: string;
  issueCategory: QueryCategory;
  subject: string;
  question: string;
  urgencyLevel: QueryUrgency;
  status: QueryStatus;
  document?: FileMetadata;
  age:number;
  gender:string;
  city:string;
  state:string;
  createdAt?: string;
  updatedAt?: string;
}


export const fetchQueries = async (): Promise<Query[]> => {
  const { data } = await api.get<Query[]>("/queries");
  return data;
};

export const fetchQuery = async (id: string): Promise<Query> => {
  const { data } = await api.get<Query>(`/queries/${id}`);
  return data;
};

export const createQuery = async (
  query: Omit<Query, "_id" | "createdAt" | "updatedAt" | "answer">
): Promise<Query> => {
  const { data } = await api.post<Query>("/queries", query);
  return data;
};

export const updateQuery = async (
  id: string,
  query: Partial<Query>
): Promise<Query> => {
  const { data } = await api.put<Query>(`/queries/${id}`, query);
  return data;
};

export const answerQuery = async (
  id: string,
  answer: string
): Promise<Query> => {
  const { data } = await api.post<Query>(`queries/${id}/answer`, { answer });
  return data;
};

export const deleteQuery = async (
  id: string
): Promise<{ success: boolean }> => {
  const { data } = await api.delete<{ success: boolean }>(`/queries/${id}`);
  return data;
};
