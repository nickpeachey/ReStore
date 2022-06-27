import { Paper, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { useHistory, useLocation } from "react-router-dom";

export default function ServerError() {
  const history = useHistory();
  const { state } = useLocation();
  return (
    <Container component={Paper}>
      <Typography variant="h5" gutterBottom>
        Server error
      </Typography>
    </Container>
  );
}
