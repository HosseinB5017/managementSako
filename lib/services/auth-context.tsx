import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, UserRole } from '@/lib/types/logistics'
import { MOCK_USERS } from '@/lib/mock-data/logistics-mock'

interface AuthContextType {
	currentUser: User
	setCurrentRole: (role: UserRole) => void
	availableUsers: User[]
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]) // Default: Super Admin

	useEffect(() => {
		const savedUser = localStorage.getItem('sako_current_user')
		if (savedUser) {
			try {
				setCurrentUser(JSON.parse(savedUser))
			} catch (e) {
				console.error(e)
			}
		}
	}, [])

	const setCurrentRole = (role: UserRole) => {
		const user = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0]
		setCurrentUser(user)
		localStorage.setItem('sako_current_user', JSON.stringify(user))
	}

	const logout = () => {
		setCurrentUser(MOCK_USERS[0])
		localStorage.removeItem('sako_current_user')
	}

	return (
		<AuthContext.Provider
			value={{
				currentUser,
				setCurrentRole,
				availableUsers: MOCK_USERS,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
