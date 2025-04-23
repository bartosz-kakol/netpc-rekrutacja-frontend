// components/RegisterForm.jsx
import { useState } from "react";
import { TextField, Button, Box, Alert, CircularProgress } from "@mui/material";
import { useApi } from "../hooks/ApiContext";

export default function RegisterForm() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [fieldError, setFieldError] = useState({username: "", password: ""});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const api = useApi();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setFieldError({ username: "", password: "" });

		// Sprawdź czy hasła są zgodne
		if (password !== confirmPassword) {
			setFieldError({
				...fieldError,
				password: "Hasła nie są identyczne."
			});

			return;
		}

		setLoading(true);

		try {
			await api.register(username, password);
			setSuccess(true);

			// Wyczyść pola formularza po udanej rejestracji
			setUsername("");
			setPassword("");
			setConfirmPassword("");
		} catch (err) {
			if (err.error) {
				const { message, field } = err.error;

				setFieldError({
					...fieldError,
					[field.toLowerCase()]: message
				});
			} else {
				setError(err.message || "Wystąpił błąd podczas rejestracji.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
			{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
			{success && <Alert severity="success" sx={{ mb: 2 }}>Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.</Alert>}

			<TextField
				margin="normal"
				required
				fullWidth
				id="register-username"
				label="Nazwa użytkownika"
				name="username"
				autoComplete="username"
				autoFocus
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				error={!!fieldError.username}
				helperText={fieldError.username}
			/>
			<TextField
				margin="normal"
				required
				fullWidth
				name="password"
				label="Hasło"
				type="password"
				id="register-password"
				autoComplete="new-password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				error={!!fieldError.password}
				helperText={fieldError.password}
			/>
			<TextField
				margin="normal"
				required
				fullWidth
				name="confirm-password"
				label="Potwierdź hasło"
				type="password"
				id="confirm-password"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				error={password !== confirmPassword && confirmPassword !== ""}
				helperText={
					password !== confirmPassword && confirmPassword !== ""
						? "Hasła nie są identyczne"
						: ""
				}
			/>
			<Button
				type="submit"
				fullWidth
				variant="contained"
				sx={{ mt: 3, mb: 2 }}
				disabled={loading}
			>
				{loading ? <CircularProgress size={24} /> : "Zarejestruj się"}
			</Button>
		</Box>
	);
}
