import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import categoryService from "../../api/categories";
import Spinner from "../../components/ui/Spinner";
import { Link } from 'react-router-dom';
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
        setLoading(false);
      } catch (_err) {
        console.error(_err);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Blog Categories
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {categories.map((category) => (
          <Grid item key={category._id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {category.description || "No description available"}
                </Typography>
                
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Categories;
