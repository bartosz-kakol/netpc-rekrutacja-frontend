import { useState } from "react";
import { TextField, Button, Box, Alert, CircularProgress } from "@mui/material";
import { useApi } from "../hooks/ApiContext";

const LoginForm = ({ onLoginSuccess }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const api = useApi();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const data = await api.login(username, password);
			localStorage.setItem("accessToken", data["accessToken"]);

			setSuccess(true);

			if (onLoginSuccess) {
				onLoginSuccess();
			}
		} catch (err) {
			setError(err.message || "Nie można połączyć się z serwerem.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
			{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
			{success && <Alert severity="success" sx={{ mb: 2 }}>Zalogowano pomyślnie!</Alert>}

			<TextField
				margin="normal"
				required
				fullWidth
				id="username"
				label="Nazwa użytkownika"
				name="username"
				autoComplete="username"
				autoFocus
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<TextField
				margin="normal"
				required
				fullWidth
				name="password"
				label="Hasło"
				type="password"
				id="password"
				autoComplete="current-password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<Button
				type="submit"
				fullWidth
				variant="contained"
				sx={{ mt: 3, mb: 2 }}
				disabled={loading}
			>
				{loading ? <CircularProgress size={24} /> : "Zaloguj się"}
			</Button>
		</Box>
	);
};

export default LoginForm;
