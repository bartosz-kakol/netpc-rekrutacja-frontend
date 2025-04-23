import { useState, useEffect } from "react";
import { Container, Paper, Typography, Box, Tabs, Tab, Button } from "@mui/material";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ContactsPage from "./components/ContactsPage";
import { ApiProvider } from "./hooks/ApiContext";

export default function App() {
    const [tabValue, setTabValue] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsAuthenticated(!!token);
    }, []);

    function handleTabChange(event, newValue) {
        setTabValue(newValue);
    }

    function handleLogout() {
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
    }

    function handleLoginSuccess() {
        setIsAuthenticated(true);
    }

    return (
        <ApiProvider>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                {isAuthenticated && (
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={handleLogout}
                    >
                        Wyloguj się
                    </Button>
                )}
            </Box>

            {isAuthenticated ? (
                <ContactsPage isAuthenticated={isAuthenticated} />
            ) : (
                <>
                    <ContactsPage isAuthenticated={isAuthenticated} />

                    <Container maxWidth="sm">
                        <Box sx={{ mt: 8, mb: 4 }}>
                            <Typography variant="h3" component="h1" align="center" gutterBottom>
                                Menadżer kontaktów
                            </Typography>
                            <Paper elevation={3}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs
                                        value={tabValue}
                                        onChange={handleTabChange}
                                        variant="fullWidth"
                                    >
                                        <Tab label="Logowanie" />
                                        <Tab label="Rejestracja" />
                                    </Tabs>
                                </Box>
                                <Box sx={{ p: 3 }}>
                                    {tabValue === 0 && <LoginForm onLoginSuccess={handleLoginSuccess} />}
                                    {tabValue === 1 && <RegisterForm />}
                                </Box>
                            </Paper>
                        </Box>
                    </Container>
                </>
            )}
        </ApiProvider>
    );
}
