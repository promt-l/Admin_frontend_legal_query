import api from '../config/api';

export const getCurrentUser = async () => {
    try{
        const res = await api.get('/auth/me');
        return res.data;
    }catch(error:any){
        throw new Error("Not authenticated");
    }
};

export const logout = async () => {
  await api.post("/auth/logout");
};
