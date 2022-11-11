import { Box, Typography, Pagination } from "@mui/material";
import { MetaData } from "../models/pagination";

interface Props {
  metaData: MetaData;
  onPageChange: (page: number) => void;
}

export default function AppPagination({ metaData, onPageChange }: Props) {
  const { CurrentPage, TotalCount, TotalPages, PageSize } = metaData;
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography>
        <b>
          Displaying {(CurrentPage - 1) * PageSize + 1}-
          {CurrentPage * PageSize > TotalCount
            ? TotalCount
            : CurrentPage * PageSize}
          &nbsp; of {TotalCount} items
        </b>
      </Typography>
      <Pagination
        color="secondary"
        size="large"
        count={TotalPages}
        page={CurrentPage}
        onChange={(e, page) => onPageChange(page)}
      />
    </Box>
  );
}
