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
  Switch,
  Divider,
} from "@mui/material";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import NavbarPrivate from "../NavbarPrivate";
import { MODELS_LABELS, MODELS } from "../../constants";
import { getSettings, updateSettings } from "../../services/user-service";

const options = [MODELS.VECTOR, MODELS.LLM, MODELS.DEEPSEEK, MODELS.GEMINI];

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    smart_search: {},
    is_premium: false,
  });

  const canSubmit = Object.keys(settings)?.length > 0;

  useEffect(() => {
    setLoading(true);
    getSettings()
      .then((data) =>
        setSettings({
          smart_search: data?.settings?.smart_search ?? {},
          is_premium: data?.settings?.is_premium,
        })
      )
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = () => {
    setLoading(true);
    if (canSubmit) {
      updateSettings({ settings })
        .then((data) =>
          setSettings({
            smart_search: data?.settings?.smart_search ?? {},
            is_premium: data?.settings?.is_premium,
          })
        )
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
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
          <Typography
            sx={{ display: "flex", alignItems: "center" }}
            variant="h6"
            gutterBottom
          >
            <TroubleshootIcon sx={{ marginLeft: "15px" }} />
            <Box
              sx={{
                fontWeight: 600,
                display: "inline-block",
                marginLeft: "15px",
              }}
            >
              Enable Smart Search
            </Box>
          </Typography>
          <List dense sx={{ marginLeft: "90px" }}>
            {options.map((optionKey) => (
              <ListItem key={optionKey} disablePadding>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={loading}
                      checked={settings?.smart_search?.[optionKey] || false}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smart_search: {
                            ...settings?.smart_search,
                            [optionKey]: e?.target?.checked,
                          },
                        })
                      }
                    />
                  }
                  label={MODELS_LABELS[optionKey]}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ m: "20px 0" }} />
          <Typography
            sx={{ display: "flex", alignItems: "center" }}
            variant="h6"
            gutterBottom
          >
            <Switch
              checked={settings?.is_premium}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  is_premium: e?.target?.checked,
                });
              }}
            />
            <Box sx={{ fontWeight: 600, display: "inline-block" }}>
              Enable Premium
            </Box>
          </Typography>
        </Paper>
        <Box align="center">
          <Button
            variant="contained"
            disabled={loading || !canSubmit}
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
