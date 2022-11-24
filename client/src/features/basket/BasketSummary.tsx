import {
  TableContainer,
  Paper,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useAppSelector } from "../../app/store/configureStore";
import { currencyFormat } from "../../app/util/util";

export default function BasketSummary() {
  const { basket } = useAppSelector((state) => state.basket);
  const subtotal =
    basket?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) ??
    0;
  const deliveryFee = subtotal > 10000 ? 0 : 500;
  return (
    <TableContainer
      component={Paper}
      variant={"outlined"}
      sx={{ marginTop: 0.5, marginBottom: 0.5 }}
    >
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={2}>Subtotal</TableCell>
            <TableCell align="right">{currencyFormat(subtotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2}>Delivery fee*</TableCell>
            <TableCell align="right">{currencyFormat(deliveryFee)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell align="right">
              {currencyFormat(subtotal + deliveryFee)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
