# Totem Assets

This folder contains bundled totem sprites for the free tier of MemPal.

## Folder Structure

```
totems/
├── common/          # Common everyday objects
├── nature/          # Plants, animals, natural elements
├── fantasy/         # Magical and fantastical items
├── knowledge/       # Books, scrolls, academic items
├── food/            # Food and drink items
├── tools/           # Tools and equipment
├── treasures/       # Valuable items, gems, artifacts
└── misc/            # Miscellaneous items
```

## Adding New Sprites

1. Add PNG files (32x32 or 64x64 recommended) to the appropriate category folder
2. Register the sprite in `src/config/assetRegistry.ts`
3. Include relevant tags for the suggestion system

## Sprite Requirements

- PNG format with transparency
- Pixel art style preferred
- Consistent size within categories
- Clear, recognizable silhouette
