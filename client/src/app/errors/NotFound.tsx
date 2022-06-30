import { Button, Divider, Paper, Typography } from "@mui/material";
import { Container } from "@mui/system";

export default function NotFound() {
  return (
    <Container component={Paper} sx={{ height: 20 }}>
      <Typography gutterBottom variant="h3">
        Oops - we could find what you were looking for
      </Typography>
      <Divider />
    </Container>
  );
}
