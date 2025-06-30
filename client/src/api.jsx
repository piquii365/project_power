import axios from "axios"
export const BASE_URL = " http://localhost:3001/api"
const apiClient =  axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
})
// auth
export const login = async(formData)=>{
    try {
        const {data} = await apiClient.post("/auth/login", formData)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const register = async(formData)=>{
    try {
        const {data} = await apiClient.post("/auth/register", formData)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const refresh = async()=>{
    try {
        const {data} = await apiClient.get("/auth/refresh")
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
// users
export const profile = async()=>{
    try {
        const {data} = await apiClient.get("/users/profile")
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const updateProfile = async(formData)=>{
    try {
        const {data} = await apiClient.put("/users/profile", formData)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const getUsers = async( page = 1, limit = 10, role, department, search=null)=>{
    try {
        const {data} = await apiClient.get("/users/",{
            queryParams: {
                page,
                limit,
                role,
                department,
                search
            }
        })
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const getUserById = async(id)=>{
    try {
        const {data} = await apiClient.get(`/users/${id}`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const updateUserRole = async(id, formData)=>{
    try {
        const {data} = await apiClient.put(`/users/${id}/role`, formData)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const deleteUser = async(id)=>{
    try {
        const {data} = await apiClient.delete(`/users/${id}`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
// analytics
export const getOverview = async(id)=>{
    try {
        const {data} = await apiClient.get(`/analytics/overview`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const getProgress = async(id)=>{
    try {
        const {data} = await apiClient.get(`/analytics/progress`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
// onboarding
export const getTasks = async(status, category, priority)=>{
    try {
        const {data} = await apiClient.get(`/onboarding/tasks?status=${status}&category=${category}&priority=${priority}`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const getTaskById = async(id)=>{
    try {
        const {data} = await apiClient.get(`/onboarding/tasks/${id}`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const updateTask = async(id)=>{
    try {
        const {data} = await apiClient.put(`/onboarding/tasks/${id}`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const getRecommendations = async()=>{
    try {
        const {data} = await apiClient.get(`/onboarding/recommendations`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const trackRecommendationInteraction = async(id, formData)=>{
    try {
        const {data} = await apiClient.post(`/onboarding/recommendations/${id}/interact`, formData)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const assignTask = async(formData)=>{
    try {
        const {data} = await apiClient.post(`/onboarding/assign`, formData)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
// chart
export const sendMessage = async(formData)=>{
    try {
        const {data} = await apiClient.post(`/chat/message`, formData)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const getChartHistory = async(page = 1, limit = 20)=>{
    try {
        const {data} = await apiClient.get(`/chat/history?page=${page}&limit=${limit}`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const sendFeedback = async(id, formData)=>{
    try {
        const {data} = await apiClient.get(`/chat/feedback/${id}`, formData)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const getChatAnalytics = async(timeframe = '30d')=>{
    try {
        const {data} = await apiClient.get(`/chat/analytics?timeframe=${timeframe}`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}
export const  deleteChatHistory= async(timeframe = '30d')=>{
    try {
        const {data} = await apiClient.delete(`/chat/history`)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}