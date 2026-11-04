import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import uploadService from '../../api/uploads';

const DEFAULT_IMAGE = 'no-photo.jpg';

const FeaturedImageUploader = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const hasImage = value && value !== DEFAULT_IMAGE;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file); 
      const data = await uploadService.uploadImage(formData);

      const url =
        data?.url ||
        data?.secure_url ||
        data?.data?.url ||
        data?.data?.secure_url ||
        data?.imageUrl ||
        data?.data?.imageUrl;

      if (!url) throw new Error('Upload succeeded but no URL was returned');

      onChange(url);
      toast.success('Image uploaded');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Upload failed'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => onChange(DEFAULT_IMAGE);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        Featured Image
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {hasImage ? (
          <Box
            component="img"
            src={value}
            alt="Featured preview"
            sx={{
              width: 160,
              height: 100,
              objectFit: 'cover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 160,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              borderRadius: 1,
              color: 'text.secondary',
              fontSize: '0.8rem',
              textAlign: 'center',
              px: 1,
            }}
          >
            No image selected
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFile}
          />

          <Button
            variant="outlined"
            startIcon={
              uploading ? <CircularProgress size={16} /> : <UploadIcon />
            }
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : hasImage ? 'Replace Image' : 'Upload Image'}
          </Button>

          {hasImage && (
            <IconButton
              color="error"
              onClick={handleRemove}
              disabled={uploading}
              aria-label="Remove image"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        JPG, PNG, or WEBP — max 5 MB. Uploaded to Cloudinary.
      </Typography>
    </Box>
  );
};

export default FeaturedImageUploader;
