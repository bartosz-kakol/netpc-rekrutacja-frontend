import { useState, useEffect } from "react";
import { useApi } from "../hooks/ApiContext";
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  VpnKey as KeyIcon,
} from "@mui/icons-material";

export default function ContactsPage({ isAuthenticated }) {
  const api = useApi();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    category: "",
    subcategory: "",
    phoneNumber: "",
    dateOfBirth: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const categories = ["Służbowy", "Prywatny", "Inny"];
  const sluzbowySubcategories = ["Szef", "Klient", "Współpracownik"];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      setError(err.error?.message || "Nie udało się pobrać kontaktów.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setIsViewMode(true);
  };

  const handleAddContact = () => {
    // Only allow adding contacts if user is authenticated
    if (!isAuthenticated) {
      setError("Musisz być zalogowany, aby dodawać kontakty.");
      return;
    }

    setSelectedContact(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      category: "",
      subcategory: "",
      phoneNumber: "",
      dateOfBirth: "",
      password: "",
    });
    setFormErrors({});
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEditContact = (contact) => {
    // Only allow editing if user is authenticated
    if (!isAuthenticated) {
      setError("Musisz być zalogowany, aby edytować kontakty.");
      return;
    }

    setSelectedContact(contact);

    const dateOfBirth = contact.dateOfBirth
        ? new Date(contact.dateOfBirth).toISOString().split("T")[0]
        : "";

    setFormData({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      category: contact.category || "",
      subcategory: contact.subcategory || "",
      phoneNumber: contact.phoneNumber || "",
      dateOfBirth: dateOfBirth,
    });
    setFormErrors({});
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDeleteContact = (contact) => {
    // Only allow deleting if user is authenticated
    if (!isAuthenticated) {
      setError("Musisz być zalogowany, aby usuwać kontakty.");
      return;
    }

    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      // Clear subcategory when category changes
      setFormData({
        ...formData,
        [name]: value,
        subcategory: "", // Reset subcategory when category changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "Imię jest wymagane";

    if (!formData.lastName.trim())
      errors.lastName = "Nazwisko jest wymagane";

    if (!formData.email.trim()) errors.email = "Email jest wymagany";

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Niepoprawny format adresu email";

    if (!formData.category) errors.category = "Kategoria jest wymagana";

    // Make subcategory mandatory
    if (formData.category === "Służbowy" && !formData.subcategory) 
      errors.subcategory = "Podkategoria jest wymagana";
    else if (formData.category !== "Prywatny" && !formData.subcategory?.trim())
      errors.subcategory = "Podkategoria jest wymagana";

    if (!formData.phoneNumber.trim())
      errors.phoneNumber = "Numer telefonu jest wymagany";

    if (
        formData.phoneNumber &&
        !/^\+?[0-9\s-]{9,15}$/.test(formData.phoneNumber)
    )
      errors.phoneNumber = "Niepoprawny format numeru telefonu";

    // Make date of birth mandatory
    if (!formData.dateOfBirth)
      errors.dateOfBirth = "Data urodzenia jest wymagana";

    // Validate password only when creating a new contact
    if (!selectedContact && !formData.password.trim())
      errors.password = "Hasło jest wymagane";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSubmit() {
    // Only allow submitting if user is authenticated
    if (!isAuthenticated) {
      setError("Musisz być zalogowany, aby zapisywać zmiany.");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const contactData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth
            ? new Date(formData.dateOfBirth).toISOString()
            : null,
      };

      if (selectedContact) {
        await api.updateContact(selectedContact.id, contactData);
      } else {
        await api.createContact(contactData);
      }

      setIsDialogOpen(false);
      fetchContacts();
    } catch (err) {
      setError(
          err.error?.message ||
          "Wystąpił błąd podczas zapisywania kontaktu.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    // Only allow deleting if user is authenticated
    if (!isAuthenticated) {
      setError("Musisz być zalogowany, aby usuwać kontakty.");
      setIsDeleteDialogOpen(false);
      return;
    }

    if (!selectedContact) return;

    setLoading(true);
    setError("");

    try {
      await api.deleteContact(selectedContact.id);
      setIsDeleteDialogOpen(false);
      fetchContacts();
    } catch (err) {
      setError(
          err.error?.message ||
          "Wystąpił błąd podczas usuwania kontaktu.",
      );
    } finally {
      setLoading(false);
    }
  }

  const handlePasswordChange = (contact) => {
    // Only allow password change if user is authenticated
    if (!isAuthenticated) {
      setError("Musisz być zalogowany, aby zmieniać hasła kontaktów.");
      return;
    }

    setSelectedContact(contact);
    setNewPassword("");
    setPasswordError("");
    setIsPasswordDialogOpen(true);
  };

  const validatePassword = () => {
    if (!newPassword.trim()) {
      setPasswordError("Hasło jest wymagane");
      return false;
    }
    setPasswordError("");
    return true;
  };

  async function handleConfirmPasswordChange() {
    // Only allow password change if user is authenticated
    if (!isAuthenticated) {
      setError("Musisz być zalogowany, aby zmieniać hasła kontaktów.");
      setIsPasswordDialogOpen(false);
      return;
    }

    if (!validatePassword() || !selectedContact) return;

    setLoading(true);
    setError("");

    try {
      // Create a copy of the contact with the new password
      const contactData = {
        firstName: selectedContact.firstName,
        lastName: selectedContact.lastName,
        email: selectedContact.email,
        category: selectedContact.category,
        subcategory: selectedContact.subcategory,
        phoneNumber: selectedContact.phoneNumber,
        dateOfBirth: selectedContact.dateOfBirth,
        password: newPassword
      };

      await api.updateContact(selectedContact.id, contactData);
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      fetchContacts();
    } catch (err) {
      setError(
          err.error?.message ||
          "Wystąpił błąd podczas zmiany hasła.",
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "Nie podano";

    const date = new Date(dateString);

    return date.toLocaleDateString();
  }

  return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Lista wpisów
          </Typography>

          {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
          )}

          {isAuthenticated && (
            <Box
                sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
            >
              <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddContact}
              >
                Dodaj kontakt
              </Button>
            </Box>
          )}

          <Paper elevation={3}>
            {loading && !isDialogOpen && !isDeleteDialogOpen ? (
                <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      p: 3,
                    }}
                >
                  <CircularProgress />
                </Box>
            ) : contacts.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body1">
                    Nie ma jeszcze żadnych kontaktów.
                  </Typography>
                </Box>
            ) : (
                <List>
                  {contacts.map((contact, index) => (
                      <Box key={contact.id}>
                        <ListItem
                            button
                            onClick={() =>
                                handleViewContact(contact)
                            }
                        >
                          <ListItemText
                              primary={`${contact.firstName} ${contact.lastName}`}
                              secondary={contact.email}
                          />
                          {isAuthenticated && (
                            <ListItemSecondaryAction>
                              <IconButton
                                  edge="end"
                                  aria-label="edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditContact(contact);
                                  }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                  edge="end"
                                  aria-label="change-password"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePasswordChange(contact);
                                  }}
                              >
                                <KeyIcon />
                              </IconButton>
                              <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteContact(
                                        contact,
                                    );
                                  }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                        {index < contacts.length - 1 && <Divider />}
                      </Box>
                  ))}
                </List>
            )}
          </Paper>
        </Box>

        {selectedContact && isViewMode && (
            <Dialog
                open={true}
                onClose={() => setIsViewMode(false)}
                maxWidth="sm"
                fullWidth
            >
              <DialogTitle>
                <Box display="flex" alignItems="center">
                  <IconButton
                      edge="start"
                      color="inherit"
                      onClick={() => setIsViewMode(false)}
                      aria-label="close"
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {selectedContact.firstName}{" "}
                    {selectedContact.lastName}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Email:
                    </Typography>
                    <Typography variant="body1">
                      {selectedContact.email || "Nie podano"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Telefon:
                    </Typography>
                    <Typography variant="body1">
                      {selectedContact.phoneNumber ||
                          "Nie podano"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Kategoria:
                    </Typography>
                    <Typography variant="body1">
                      {selectedContact.category || "Nie podano"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      Podkategoria:
                    </Typography>
                    <Typography variant="body1">
                      {selectedContact.subcategory ||
                          "Nie podano"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Data urodzenia:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedContact.dateOfBirth)}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                    onClick={() => handleEditContact(selectedContact)}
                    color="primary"
                >
                  Edytuj
                </Button>
                <Button
                    onClick={() => handleDeleteContact(selectedContact)}
                    color="error"
                >
                  Usuń
                </Button>
              </DialogActions>
            </Dialog>
        )}

        <Dialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            maxWidth="sm"
            fullWidth
        >
          <DialogTitle>
            {selectedContact ? "Edytuj kontakt" : "Dodaj nowy kontakt"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                    name="firstName"
                    label="Imię"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.firstName}
                    helperText={formErrors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                    name="lastName"
                    label="Nazwisko"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.lastName}
                    helperText={formErrors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    name="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    name="phoneNumber"
                    label="Numer telefonu"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.phoneNumber}
                    helperText={formErrors.phoneNumber}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                    fullWidth
                    required
                    error={!!formErrors.category}
                >
                  <InputLabel>Kategoria</InputLabel>
                  <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      label="Kategoria"
                  >
                    {categories.map((category) => (
                        <MenuItem
                            key={category}
                            value={category}
                        >
                          {category}
                        </MenuItem>
                    ))}
                  </Select>
                  {formErrors.category && (
                      <Typography variant="caption" color="error">
                        {formErrors.category}
                      </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                {formData.category === "Służbowy" ? (
                  <FormControl fullWidth required error={!!formErrors.subcategory}>
                    <InputLabel>Podkategoria</InputLabel>
                    <Select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      label="Podkategoria"
                    >
                      {sluzbowySubcategories.map((subcategory) => (
                        <MenuItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.subcategory && (
                      <Typography variant="caption" color="error">
                        {formErrors.subcategory}
                      </Typography>
                    )}
                  </FormControl>
                ) : formData.category === "Prywatny" ? (
                  <TextField
                    name="subcategory"
                    label="Podkategoria"
                    value=""
                    disabled
                    fullWidth
                  />
                ) : (
                  <TextField
                    name="subcategory"
                    label="Podkategoria"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.subcategory}
                    helperText={formErrors.subcategory}
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                    name="dateOfBirth"
                    label="Data urodzenia"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.dateOfBirth}
                    helperText={formErrors.dateOfBirth}
                    InputLabelProps={{
                      shrink: true,
                    }}
                />
              </Grid>
              {!selectedContact && (
                <Grid item xs={12}>
                  <TextField
                    name="password"
                    label="Hasło"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
                onClick={() => setIsDialogOpen(false)}
                color="inherit"
            >
              Anuluj
            </Button>
            <Button
                onClick={handleSubmit}
                color="primary"
                disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Zapisz"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
            open={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
        >
          <DialogTitle>Potwierdź usunięcie</DialogTitle>
          <DialogContent>
            <Typography>
              Czy na pewno chcesz usunąć kontakt{" "}
              {selectedContact?.firstName} {selectedContact?.lastName}
              ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
                onClick={() => setIsDeleteDialogOpen(false)}
                color="inherit"
            >
              Anuluj
            </Button>
            <Button
                onClick={handleConfirmDelete}
                color="error"
                disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Usuń"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
            open={isPasswordDialogOpen}
            onClose={() => setIsPasswordDialogOpen(false)}
        >
          <DialogTitle>Zmień hasło</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Zmień hasło dla kontaktu{" "}
              {selectedContact?.firstName} {selectedContact?.lastName}
            </Typography>
            <TextField
              name="newPassword"
              label="Nowe hasło"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              error={!!passwordError}
              helperText={passwordError}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button
                onClick={() => setIsPasswordDialogOpen(false)}
                color="inherit"
            >
              Anuluj
            </Button>
            <Button
                onClick={handleConfirmPasswordChange}
                color="primary"
                disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Zapisz"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
  );
}
