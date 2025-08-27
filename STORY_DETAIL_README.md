# Story Pages Implementation

## Overview
A comprehensive story system has been implemented for the WAP Web Base project following the requested URL structure:

- **`/`** → Home page (existing)
- **`/[idDoc]`** → Story information page
- **`/[idDoc]/[IdDetail]`** → Story reading content page

The system provides users with detailed information about stories and chapter reading functionality with SEO optimization and responsive design.

## URL Structure

### Story Information Page
- **URL Pattern**: `/{idDoc}`
- **Examples**: 
  - `/story-123` → Story with ID "story-123"
  - `/abc-def` → Story with ID "abc-def"

### Chapter Reading Page
- **URL Pattern**: `/{idDoc}/{IdDetail}`
- **Examples**:
  - `/story-123/chapter-1` → Chapter 1 of story "story-123"
  - `/story-123/chapter-25` → Chapter 25 of story "story-123"
  - `/story-123/latest` → Latest chapter of story "story-123"

## Files Created

### 1. **Story Information Page**
- **Path**: `src/app/[idDoc]/page.tsx`
- **Type**: Client-side React component
- **Features**:
  - Dynamic routing with idDoc parameter
  - Story information display (title, author, description, stats)
  - Chapter list with navigation links
  - Domain-specific configuration integration
  - Responsive design and error handling

### 2. **Story Metadata Generation**
- **Path**: `src/app/[idDoc]/layout.tsx`
- **Type**: Server-side metadata generation
- **Features**:
  - Dynamic Open Graph and Twitter Card metadata
  - Story-specific title and descriptions
  - Proper canonical URLs
  - Fallback metadata for error cases

### 3. **Chapter Reading Page**
- **Path**: `src/app/[idDoc]/[IdDetail]/page.tsx`
- **Type**: Client-side React component
- **Features**:
  - Chapter content display with navigation
  - Previous/Next chapter navigation
  - Reading-optimized typography
  - Breadcrumb navigation
  - Story information sidebar

### 4. **Chapter Metadata Generation**
- **Path**: `src/app/[idDoc]/[IdDetail]/layout.tsx`
- **Type**: Server-side metadata generation
- **Features**:
  - Chapter-specific SEO metadata
  - Dynamic title generation
  - Reading-optimized structured data

### 5. **Not Found Pages**
- **Story 404**: `src/app/[idDoc]/not-found.tsx`
- **Chapter 404**: `src/app/[idDoc]/[IdDetail]/not-found.tsx`
- **Features**: User-friendly error messages with navigation options

## Usage

### Accessing Story Pages
Stories can be accessed through the following URL patterns:

**Story Information:**
```
https://yourdomain.com/story-123
https://yourdomain.com/abc-def-story
https://yourdomain.com/{any-idDoc}
```

**Chapter Reading:**
```
https://yourdomain.com/story-123/chapter-1
https://yourdomain.com/story-123/chapter-25
https://yourdomain.com/story-123/latest
https://yourdomain.com/{idDoc}/{IdDetail}
```

### Linking to Story Pages
The story card components have been updated to automatically link to the story information pages:
```typescript
// Links will automatically route to /{idDoc}
<StoryCard story={storyData} index={0} showImages={true} />
```

### Navigation Flow
1. **Home** (`/`) → View story list
2. **Click story** → Story info page (`/{idDoc}`)
3. **Click chapter** → Chapter reading (`/{idDoc}/{IdDetail}`)
4. **Navigation controls** → Previous/Next chapters, back to story info

## Development Setup

### Current Implementation
The system currently uses **mock data** for development purposes. The story detail service includes a `fetchStoryDetailDev` function that generates realistic test data.

### API Integration
To integrate with a real API, update the following:

1. **Replace mock function** in story detail page:
```typescript
// Change from:
import { fetchStoryDetailDev as fetchStoryDetail } from '../../../services/story-detail.service';

// To:
import { fetchStoryDetail } from '../../../services/story-detail.service';
```

2. **Update API endpoint** in the service:
```typescript
// Update the API URL in story-detail.service.ts
const externalApiUrl = `${apiConfig.baseUrl}/story/${encodeURIComponent(slug)}`;
```

3. **Update layout metadata generation**:
```typescript
// Change from:
import { fetchStoryDetailDev } from '../../../services/story-detail.service';

// To:
import { fetchStoryDetailSync } from '../../../services/story-detail.service';
```

## Features

### ✅ Implemented Features
- [x] **Story Information Page** (`/{idDoc}`)
  - [x] Story details display (title, author, description, stats)
  - [x] Chapter list with clickable navigation
  - [x] Action buttons (read from start, latest chapter)
  - [x] Responsive design for all devices
  - [x] Server-side SEO metadata generation
- [x] **Chapter Reading Page** (`/{idDoc}/{IdDetail}`)
  - [x] Chapter content display with optimized typography
  - [x] Previous/Next chapter navigation
  - [x] Breadcrumb navigation
  - [x] Story information sidebar
  - [x] Reading-focused design
  - [x] Chapter-specific SEO metadata
- [x] **System Features**
  - [x] Domain-specific configuration integration
  - [x] Custom 404 error handling for both routes
  - [x] TypeScript type safety
  - [x] Loading states and error handling
  - [x] Mock data system for development testing

### 🚧 Planned Features
- [ ] Real API integration for story and chapter data
- [ ] User reading progress tracking
- [ ] Bookmarking and favorites system
- [ ] Related stories recommendations
- [ ] User rating and review system
- [ ] Social sharing buttons
- [ ] Reading settings (font size, theme, etc.)
- [ ] Comment system for chapters

## SEO Optimization

The story detail pages include comprehensive SEO optimization:

### Metadata Generation
- **Dynamic titles**: `[Story Name] | [Domain Name]`
- **Rich descriptions**: Story summary with author information
- **Keywords**: Story name, author, genre, and relevant terms  
- **Open Graph**: Story thumbnail, title, and description
- **Twitter Cards**: Optimized for social sharing
- **Canonical URLs**: Proper URL structure for search engines

### Structured Data
- Article metadata with publication dates
- Author information
- Category/genre classification
- Reading statistics

## Performance Considerations

### Server-Side Rendering
- Metadata generated on the server for optimal SEO
- Cached domain configurations to reduce load times
- Efficient data fetching with error boundaries

### Client-Side Optimization
- Lazy loading for images
- Responsive design for all devices
- Optimized re-renders with proper state management
- Error boundaries to prevent crashes

## Testing

### Mock Data Testing
The system includes realistic mock data for testing:
```typescript
// Generate test story
const mockStory = generateMockStoryDetail('test-story-slug');
```

### Error Testing
- 404 handling for non-existent stories
- API timeout and error scenarios
- Network failure recovery

## Deployment Notes

### Domain Configuration
Ensure your domain configuration includes proper:
- SEO metadata settings
- Theme colors for story pages
- Social media integration

### Performance Monitoring
Monitor the following metrics:
- Page load times for story detail pages
- SEO performance in search results
- User engagement on story pages

## Integration with Existing Components

### Story Cards
All existing story card components (`StoryCard`, `StoryList`, `StoryGrid`, `StoryRanking`) have been updated to link to the new story detail pages automatically.

### Navigation
The story detail pages include:
- Breadcrumb navigation
- Back to homepage links
- Domain-specific header and footer

## Troubleshooting

### Common Issues
1. **Import path errors**: Use relative paths if `@/` alias doesn't work
2. **Type conflicts**: Ensure consistent use of interfaces from `src/types/index.ts`
3. **Mock data**: Remember to switch to real API calls in production

### Debug Mode
Enable debug logging in the story detail service to troubleshoot API issues:
```typescript
console.log('[StoryDetailService] API response:', rawData);
```