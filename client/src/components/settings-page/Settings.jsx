import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  List,
  ListItem,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import NavbarPrivate from "../NavbarPrivate";
import { MODELS_LABELS, MODELS } from "../../constants";
import { getSettings, updateSettings } from "../../services/user-service";

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});

  const options = [MODELS.VECTOR, MODELS.LLM, MODELS.DEEPSEEK, MODELS.GEMINI];

  useEffect(() => {
    setLoading(true);
    getSettings()
      .then((data) => setSettings(data?.settings?.smart_search ?? {}))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = () => {
    setLoading(true);
    updateSettings({ settings })
      .then((data) => setSettings(data?.settings?.smart_search ?? {}))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <NavbarPrivate />
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 2 }}>
        Update Settings
      </Typography>

      <Container sx={{ width: 600 }}>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 2, mb: 3, mt: 3, backgroundColor: "#f9f9f9" }}
        >
          <Typography sx={{ fontWeight: 600 }} variant="h6" gutterBottom>
            Enable Smart Search
          </Typography>
          <List dense sx={{ padding: "0 40px" }}>
            {options.map((optionKey) => (
              <ListItem key={optionKey} disablePadding>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={loading}
                      checked={settings[optionKey] || false}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [optionKey]: e.target.checked,
                        })
                      }
                    />
                  }
                  label={MODELS_LABELS[optionKey]}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
        <Box align="center">
          <Button
            variant="contained"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? <CircularProgress size={24} /> : "Confirm"}
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default SettingsPage;
