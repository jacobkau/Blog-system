import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import postService from "../../api/posts";
import Spinner from "../../components/ui/Spinner";
import { useAuthContext } from "../../context";

const SinglePost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await postService.getPost(id);
        setPost(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError(err.response?.data?.message || "Failed to load post");
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await postService.deletePost(post._id, user.token);
      navigate("/posts"); 
    } catch (err) {
      console.error("Failed to delete:", err);
      alert(err.response?.data?.message || "Error deleting post");
    }
  };

  // Check if current user is the author of the post
  const isAuthor = user?.id?.toString() === post?.author?._id?.toString();

  if (loading) return <Spinner />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!post) return <Typography>Post not found</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <article>
        <Typography variant="h3" component="h1" gutterBottom>
          {post.title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mr: 2 }}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            By {post.author?.name || "Unknown author"}
          </Typography>
        </Box>       

        <Typography
          variant="body1"
          paragraph
          sx={{ fontSize: "1.1rem", lineHeight: 1.8, whiteSpace: "pre-line" }}
        >
          {post.content}
        </Typography>

        {isAuthor && (
          <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={`/edit-post/${post._id}`} // Simplified path
              state={{ post }} // Pass post data to edit page
            >
              Edit Post
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
            >
              Delete Post
            </Button>
          </Box>
        )}
      </article>
    </Container>
  );
};

export default SinglePost;