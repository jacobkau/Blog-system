import { Grid, Card, CardContent, Typography, CardMedia, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const PostList = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <Typography>No posts to display</Typography>;
  }
  return (
    <>
      {posts.map((post) => (
        <Grid item xs={12} md={6} lg={4} key={post._id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                       <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                {post.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {post.excerpt}
              </Typography>
            </CardContent>
            <Button 
              component={Link} 
              to={`/posts/${post._id}`}
              size="small"
              sx={{ m: 2 }}
            >
              Read More
            </Button>
          </Card>
        </Grid>
      ))}
    </>
  );
};

export default PostList;