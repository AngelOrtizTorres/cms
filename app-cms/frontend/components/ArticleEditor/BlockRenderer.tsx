'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
} from '@mui/material';
import { ContentBlock } from './BlockEditor';

interface BlockRendererProps {
  blocks: ContentBlock[];
  className?: string;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks, className }) => {
  if (!blocks || blocks.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>Sin contenido</Typography>
      </Box>
    );
  }

  const renderBlock = (block: ContentBlock) => {
    const key = block.id;

    switch (block.type) {
      case 'heading':
        const headingVariant = {
          1: 'h1',
          2: 'h2',
          3: 'h3',
          4: 'h4',
          5: 'h5',
          6: 'h6',
        }[block.level || 2] as any;

        return (
          <Typography
            key={key}
            variant={headingVariant}
            sx={{
              mt: 3,
              mb: 1.5,
              fontWeight: 600,
              '&:first-of-type': { mt: 0 },
            }}
          >
            {block.content}
          </Typography>
        );

      case 'paragraph':
        return (
          <Typography
            key={key}
            variant="body1"
            sx={{
              mb: 2,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              textAlign: block.align || 'left',
              fontWeight: block.bold ? 700 : 400,
              fontStyle: block.italic ? 'italic' : 'normal',
              textDecoration: block.underline ? 'underline' : 'none',
            }}
          >
            {block.content}
          </Typography>
        );

      case 'image':
        return (
          <Box
            key={key}
            sx={{
              my: 3,
              textAlign: 'center',
            }}
          >
            <Box
              component="img"
              src={block.imageUrl}
              alt={block.imageAlt || 'Imagen'}
              sx={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: 1,
                maxHeight: 500,
              }}
            />
            {block.imageAlt && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                {block.imageAlt}
              </Typography>
            )}
          </Box>
        );

      case 'quote':
        return (
          <Box
            key={key}
            sx={{
              my: 2.5,
              pl: 2.5,
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
              p: 2,
              borderRadius: '0 4px 4px 0',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontStyle: 'italic',
                color: 'text.secondary',
                lineHeight: 1.8,
              }}
            >
              {block.content}
            </Typography>
          </Box>
        );

      case 'list':
        return (
          <Box key={key} sx={{ my: 2 }}>
            <List
              sx={{
                listStyleType: block.listType === 'ordered' ? 'decimal' : 'disc',
                pl: 2.5,
              }}
            >
              {(block.listItems || []).map((item, idx) => (
                item && (
                  <ListItem
                    key={idx}
                    sx={{
                      display: 'list-item',
                      p: 0.5,
                    }}
                  >
                    <Typography variant="body1">{item}</Typography>
                  </ListItem>
                )
              ))}
            </List>
          </Box>
        );

      case 'divider':
        return (
          <Divider
            key={key}
            sx={{
              my: 3,
            }}
          />
        );

      case 'video':
        return (
          <Box
            key={key}
            sx={{
              my: 3,
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              borderRadius: 1,
              bgcolor: '#000',
            }}
          >
            {block.videoUrl && (
              <video
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                controls
                src={block.videoUrl}
              />
            )}
          </Box>
        );

      case 'button':
        return (
          <Box
            key={key}
            sx={{
              my: 2,
              textAlign: block.align || 'left',
            }}
          >
            <Box
              component="a"
              href={block.buttonUrl || '#'}
              sx={{
                display: 'inline-block',
                px: 3,
                py: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                textDecoration: 'none',
                borderRadius: 1,
                fontWeight: 600,
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: 2,
                },
              }}
            >
              {block.buttonText || 'Botón'}
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box className={className} sx={{ typography: 'body1' }}>
      {blocks.map((block) => renderBlock(block))}
    </Box>
  );
};

export default BlockRenderer;
