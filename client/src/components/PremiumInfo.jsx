import { useState } from "react";
import { Typography, Box } from "@mui/material";

import SmartSeachInfo from "./SmartSeachInfo";

const PremiumInfo = () => {
  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => setOpenModal(false);

  return (
    <Box mt={4} px={4}>
      <Alert severity="warning" sx={{ mb: 3 }}>
        This feature is only accessible to premium users. Please contact us to
        subscribe.
      </Alert>

      <Typography variant="h5" gutterBottom>
        🔓 Unlock Premium Search Features
      </Typography>
      <Typography variant="body1" gutterBottom>
        Premium users gain access to intelligent search technologies that
        supercharge material discovery. Here's what you’re missing:
      </Typography>

      <SmartSeachInfo />

      <Box textAlign="center" mt={4}>
        <SubscriptionPage open={openModal} handleClose={handleCloseModal} />
      </Box>
    </Box>
  );
};

export default PremiumInfo;
