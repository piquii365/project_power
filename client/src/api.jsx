import axios from "axios"

// Use environment variable or fallback to localhost
export const BASE_URL = "http://localhost:3001/api"

const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth endpoints
export const login = async(formData) => {
    try {
        const { data } = await apiClient.post("/auth/login", formData)
        if (data.token) {
            localStorage.setItem('token', data.token)
        }
        return data
    } catch (error) {
        console.error('Login error:', error)
        throw error
    }
}

export const register = async(formData) => {
    try {
        const { data } = await apiClient.post("/auth/register", formData)
        if (data.token) {
            localStorage.setItem('token', data.token)
        }
        return data
    } catch (error) {
        console.error('Register error:', error)
        throw error
    }
}

export const refresh = async() => {
    try {
        const token = localStorage.getItem('token')
        const { data } = await apiClient.post("/auth/refresh", { token })
        if (data.token) {
            localStorage.setItem('token', data.token)
        }
        return data
    } catch (error) {
        console.error('Refresh error:', error)
        throw error
    }
}

// User endpoints
export const profile = async() => {
    try {
        const { data } = await apiClient.get("/users/profile")
        return data
    } catch (error) {
        console.error('Profile error:', error)
        throw error
    }
}

export const updateProfile = async(formData) => {
    try {
        const { data } = await apiClient.put("/users/profile", formData)
        return data
    } catch (error) {
        console.error('Update profile error:', error)
        throw error
    }
}

export const getUsers = async(page = 1, limit = 10, role, department, search = null) => {
    try {
        const params = new URLSearchParams()
        if (page) params.append('page', page)
        if (limit) params.append('limit', limit)
        if (role) params.append('role', role)
        if (department) params.append('department', department)
        if (search) params.append('search', search)
        
        const { data } = await apiClient.get(`/users?${params.toString()}`)
        return data
    } catch (error) {
        console.error('Get users error:', error)
        throw error
    }
}

export const getUserById = async(id) => {
    try {
        const { data } = await apiClient.get(`/users/${id}`)
        return data
    } catch (error) {
        console.error('Get user error:', error)
        throw error
    }
}

export const updateUserRole = async(id, formData) => {
    try {
        const { data } = await apiClient.put(`/users/${id}/role`, formData)
        return data
    } catch (error) {
        console.error('Update user role error:', error)
        throw error
    }
}

export const deleteUser = async(id) => {
    try {
        const { data } = await apiClient.delete(`/users/${id}`)
        return data
    } catch (error) {
        console.error('Delete user error:', error)
        throw error
    }
}

// Analytics endpoints
export const getOverview = async(timeframe = '30d') => {
    try {
        const { data } = await apiClient.get(`/analytics/overview?timeframe=${timeframe}`)
        return data
    } catch (error) {
        console.error('Get overview error:', error)
        throw error
    }
}

export const getProgress = async(timeframe = '30d') => {
    try {
        const { data } = await apiClient.get(`/analytics/progress?timeframe=${timeframe}`)
        return data
    } catch (error) {
        console.error('Get progress error:', error)
        throw error
    }
}

export const getDepartments = async(timeframe = '30d') => {
    try {
        const { data } = await apiClient.get(`/analytics/departments?timeframe=${timeframe}`)
        return data
    } catch (error) {
        console.error('Get departments error:', error)
        throw error
    }
}

export const getTaskAnalytics = async() => {
    try {
        const { data } = await apiClient.get(`/analytics/tasks`)
        return data
    } catch (error) {
        console.error('Get task analytics error:', error)
        throw error
    }
}

export const getEngagement = async(timeframe = '30d') => {
    try {
        const { data } = await apiClient.get(`/analytics/engagement?timeframe=${timeframe}`)
        return data
    } catch (error) {
        console.error('Get engagement error:', error)
        throw error
    }
}

// Onboarding endpoints
export const getTasks = async(status, category, priority) => {
    try {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        if (category) params.append('category', category)
        if (priority) params.append('priority', priority)
        
        const { data } = await apiClient.get(`/onboarding/tasks?${params.toString()}`)
        return data
    } catch (error) {
        console.error('Get tasks error:', error)
        throw error
    }
}

export const getTaskById = async(id) => {
    try {
        const { data } = await apiClient.get(`/onboarding/tasks/${id}`)
        return data
    } catch (error) {
        console.error('Get task error:', error)
        throw error
    }
}

export const updateTask = async(id, formData) => {
    try {
        const { data } = await apiClient.put(`/onboarding/tasks/${id}`, formData)
        return data
    } catch (error) {
        console.error('Update task error:', error)
        throw error
    }
}

export const getRecommendations = async() => {
    try {
        const { data } = await apiClient.get(`/onboarding/recommendations`)
        return data
    } catch (error) {
        console.error('Get recommendations error:', error)
        throw error
    }
}

export const trackRecommendationInteraction = async(id, formData) => {
    try {
        const { data } = await apiClient.post(`/onboarding/recommendations/${id}/interact`, formData)
        return data
    } catch (error) {
        console.error('Track interaction error:', error)
        throw error
    }
}

export const assignTask = async(formData) => {
    try {
        const { data } = await apiClient.post(`/onboarding/assign`, formData)
        return data
    } catch (error) {
        console.error('Assign task error:', error)
        throw error
    }
}

// Chat endpoints
export const sendMessage = async(formData) => {
    try {
        const { data } = await apiClient.post(`/chat/message`, formData)
        return data
    } catch (error) {
        console.error('Send message error:', error)
        throw error
    }
}

export const getChatHistory = async(page = 1, limit = 20) => {
    try {
        const { data } = await apiClient.get(`/chat/history?page=${page}&limit=${limit}`)
        return data
    } catch (error) {
        console.error('Get chat history error:', error)
        throw error
    }
}

export const sendFeedback = async(id, formData) => {
    try {
        const { data } = await apiClient.post(`/chat/feedback/${id}`, formData)
        return data
    } catch (error) {
        console.error('Send feedback error:', error)
        throw error
    }
}

export const getChatAnalytics = async(timeframe = '30d') => {
    try {
        const { data } = await apiClient.get(`/chat/analytics?timeframe=${timeframe}`)
        return data
    } catch (error) {
        console.error('Get chat analytics error:', error)
        throw error
    }
}

export const deleteChatHistory = async() => {
    try {
        const { data } = await apiClient.delete(`/chat/history`)
        return data
    } catch (error) {
        console.error('Delete chat history error:', error)
        throw error
    }
}