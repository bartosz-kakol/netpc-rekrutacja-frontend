import {createContext, useContext} from "react";
import {API_URL} from "../config";

// Utworzenie kontekstu
const ApiContext = createContext(null);

// Hook do łatwego korzystania z kontekstu
// eslint-disable-next-line react-refresh/only-export-components
export function useApi() {
	const context = useContext(ApiContext);

	if (!context) {
		throw new Error("useApi must be used within an ApiProvider");
	}

	return context;
}

// Provider kontekstu API
export function ApiProvider({ children }) {
	// Helper function to get auth headers
	const getAuthHeaders = () => {
		const token = localStorage.getItem("accessToken");
		return {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`
		};
	};

	// Handle API errors
	const handleApiError = async (response) => {
		if (response.status === 400) {
			const errorData = await response.json();
			throw errorData;
		}
		throw new Error("Wystąpił błąd podczas komunikacji z serwerem.");
	};

	async function login(username, password) {
		const response = await fetch(`${API_URL}/api/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				Username: username,
				Password: password,
			}),
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error("Nieprawidłowa nazwa użytkownika lub hasło.");
			}

			throw new Error("Wystąpił błąd podczas logowania.");
		}

		return response.json();
	}

	async function register(username, password) {
		const response = await fetch(`${API_URL}/api/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				Username: username,
				Password: password,
			}),
		});

		if (!response.ok) {
			if (response.status === 400) {
				throw await response.json();
			}

			throw new Error("Wystąpił błąd podczas rejestracji.");
		}

		return response.ok;
	}

	// Contacts API functions
	async function getContacts() {
		// Don't require authentication for viewing contacts
		const headers = {
			"Content-Type": "application/json"
		};

		// Add auth token if available, but don't require it
		const token = localStorage.getItem("accessToken");
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_URL}/api/contacts/`, {
			method: "GET",
			headers: headers,
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		return response.json();
	}

	async function createContact(contactData) {
		// Ensure id is not included in the request body
		const { id, ...contactWithoutId } = contactData;

		const response = await fetch(`${API_URL}/api/contacts`, {
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(contactWithoutId),
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		return response.json();
	}

	async function updateContact(id, contactData) {
		// Ensure id is not included in the request body
		const { id: contactId, ...contactWithoutId } = contactData;

		const response = await fetch(`${API_URL}/api/contacts/${id}`, {
			method: "PUT",
			headers: getAuthHeaders(),
			body: JSON.stringify(contactWithoutId),
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		return true;
	}

	async function deleteContact(id) {
		const response = await fetch(`${API_URL}/api/contacts/${id}`, {
			method: "DELETE",
			headers: getAuthHeaders(),
		});

		if (!response.ok) {
			await handleApiError(response);
		}

		return true;
	}

	// Wartość kontekstu
	const value = {
		login,
		register,
		getContacts,
		createContact,
		updateContact,
		deleteContact
	};

	return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}
