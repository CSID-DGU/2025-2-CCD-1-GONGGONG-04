# Utility Functions and Hooks

This directory contains utility functions and custom React hooks for the MindConnect project.

## Table of Contents
- [Phone Number Formatting](#phone-number-formatting)
- [Clipboard Hook](#clipboard-hook)
- [Kakao Map Integration](#kakao-map-integration)
- [Share Functionality](#share-functionality)

---

## Phone Number Formatting

**File**: `formatPhoneNumber.ts`

Formats Korean phone numbers with hyphens for better readability.

### Usage

```typescript
import { formatPhoneNumber } from '@/lib/utils/formatPhoneNumber';

// Format various phone number inputs
const formatted1 = formatPhoneNumber('02-1234-5678');  // "02-1234-5678"
const formatted2 = formatPhoneNumber('0212345678');    // "02-1234-5678"
const formatted3 = formatPhoneNumber('010 1234 5678'); // "010-1234-5678"
const formatted4 = formatPhoneNumber('01012345678');   // "010-1234-5678"
```

### Supported Formats

| Type | Pattern | Example Input | Example Output |
|------|---------|---------------|----------------|
| Mobile | 010, 011, 016-019 | `01012345678` | `010-1234-5678` |
| Seoul | 02 | `0212345678` | `02-1234-5678` |
| Seoul (9-digit) | 02 | `021234567` | `02-123-4567` |
| Regional | 031, 032, etc. | `0311234567` | `031-123-4567` |

### Edge Cases

- **Null input**: Returns `null`
- **Empty string**: Returns `null`
- **Non-digit only**: Returns `null`
- **Unrecognized pattern**: Returns original input

---

## Clipboard Hook

**File**: `../hooks/useClipboard.ts`

React hook for copying text to clipboard with automatic success state management.

### Usage

```typescript
import { useClipboard } from '@/hooks/useClipboard';

function MyComponent() {
  const { copied, copy, reset } = useClipboard();

  const handleCopy = async () => {
    await copy("Hello World");
    // `copied` will be true for 2000ms by default
  };

  return (
    <button onClick={handleCopy}>
      {copied ? '복사됨!' : '복사하기'}
    </button>
  );
}
```

### Custom Duration

```typescript
// Reset after 5 seconds instead of 2 seconds
const { copied, copy } = useClipboard(5000);
```

### API

```typescript
interface UseClipboardReturn {
  copied: boolean;          // Whether text was recently copied
  copy: (text: string) => Promise<void>;  // Copy function
  reset: () => void;        // Manually reset copied state
}
```

### Features

- Auto-reset after specified duration (default: 2000ms)
- Fallback for older browsers without Clipboard API
- Automatic cleanup on component unmount
- Error handling

---

## Kakao Map Integration

**File**: `kakaoMap.ts`

Functions for opening Kakao Map with directions or location view.

### Usage

#### Directions (길찾기)

```typescript
import { openKakaoMapDirections } from '@/lib/utils/kakaoMap';

// Open directions to a center
openKakaoMapDirections(37.5665, 126.9780, "서울시 정신건강복지센터");

// Without place name (uses default "목적지")
openKakaoMapDirections(37.5665, 126.9780);
```

#### Show Location (위치 보기)

```typescript
import { openKakaoMapLocation } from '@/lib/utils/kakaoMap';

// Show location on map
openKakaoMapLocation(37.5665, 126.9780, "서울시청");
```

### API

```typescript
function openKakaoMapDirections(
  latitude: number,
  longitude: number,
  placeName?: string
): void

function openKakaoMapLocation(
  latitude: number,
  longitude: number,
  placeName?: string
): void
```

### Features

- Opens in new tab (`_blank`)
- URL encodes place names with special characters
- Security attributes: `noopener,noreferrer`
- Error handling with console logging

---

## Share Functionality

**File**: `share.ts`

Functions for sharing content via Web Share API with clipboard fallback.

### Basic Usage

```typescript
import { shareContent, getCenterShareUrl } from '@/lib/utils/share';

const handleShare = async () => {
  const url = getCenterShareUrl(1);

  const shared = await shareContent({
    title: "서울시 정신건강복지센터",
    text: "정신건강 상담 및 지원 서비스를 확인해보세요",
    url: url
  });

  if (shared) {
    console.log("Shared via Web Share API");
  } else {
    console.log("URL copied to clipboard");
  }
};
```

### Helper Functions

#### Get Center Share URL

```typescript
import { getCenterShareUrl } from '@/lib/utils/share';

const url = getCenterShareUrl(1);
// Returns: "https://mindconnect.com/centers/1"
```

#### Create Share Options

```typescript
import { createCenterShareOptions } from '@/lib/utils/share';

const shareOptions = createCenterShareOptions(
  1,
  "서울시 정신건강복지센터",
  "정신건강 상담 및 지원"
);

await shareContent(shareOptions);
```

### API

```typescript
interface ShareOptions {
  title: string;   // Title of shared content
  text: string;    // Description
  url: string;     // URL to share
}

async function shareContent(options: ShareOptions): Promise<boolean>
// Returns: true if Web Share API used, false if clipboard fallback

function getCenterShareUrl(centerId: number): string
// Returns: Full URL for center detail page

function createCenterShareOptions(
  centerId: number,
  centerName: string,
  description?: string
): ShareOptions
```

### Features

- **Web Share API**: Uses native share on mobile devices
- **Clipboard Fallback**: Copies URL to clipboard on desktop
- **Browser Compatibility**: Works on all modern browsers
- **Error Handling**: Gracefully handles errors and user cancellation

---

## Environment Variables

### Required

```bash
# .env.local (development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.production (production)
NEXT_PUBLIC_SITE_URL=https://mindconnect.com
```

---

## Testing

Run unit tests:

```bash
npm test lib/utils/__tests__/utilities.test.ts
```

### Test Coverage

- ✅ Phone number formatting (all Korean formats)
- ✅ Share URL generation
- ✅ Share options creation
- ✅ Edge cases and error handling

---

## Integration Examples

### CenterContactInfo Component

```typescript
import { formatPhoneNumber } from '@/lib/utils/formatPhoneNumber';
import { openKakaoMapDirections } from '@/lib/utils/kakaoMap';
import { useClipboard } from '@/hooks/useClipboard';
import { useToast } from '@/hooks/use-toast';

function CenterContactInfo({ center }) {
  const { toast } = useToast();
  const { copied, copy } = useClipboard();

  // Format phone number
  const formattedPhone = formatPhoneNumber(center.phone);

  // Copy address
  const handleAddressCopy = async () => {
    await copy(center.roadAddress);
    toast({
      title: "주소가 복사되었습니다",
      duration: 2000,
    });
  };

  // Open directions
  const handleDirections = () => {
    openKakaoMapDirections(
      center.latitude,
      center.longitude,
      center.centerName
    );
  };

  return (
    <div>
      {formattedPhone && (
        <a href={`tel:${formattedPhone}`}>{formattedPhone}</a>
      )}
      <button onClick={handleAddressCopy}>
        {copied ? '복사됨' : '주소 복사'}
      </button>
      <button onClick={handleDirections}>길찾기</button>
    </div>
  );
}
```

### CenterHeader Component

```typescript
import { shareContent, getCenterShareUrl } from '@/lib/utils/share';
import { useToast } from '@/hooks/use-toast';

function CenterHeader({ center }) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = getCenterShareUrl(center.id);

    const shared = await shareContent({
      title: center.centerName,
      text: `${center.centerName} - 마음이음`,
      url
    });

    if (!shared) {
      // Clipboard fallback was used
      toast({
        title: "링크가 복사되었습니다",
        description: "원하는 곳에 붙여넣기 하세요",
        duration: 2000,
      });
    }
  };

  return (
    <button onClick={handleShare}>공유하기</button>
  );
}
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Clipboard API | ✅ 66+ | ✅ 63+ | ✅ 13.1+ | ✅ 79+ |
| Web Share API | ✅ 89+ | ❌ | ✅ 12.2+ | ✅ 93+ |
| Fallback (execCommand) | ✅ All | ✅ All | ✅ All | ✅ All |

**Note**: Web Share API is primarily supported on mobile browsers. Desktop browsers will use clipboard fallback.

---

## Best Practices

1. **Phone Numbers**: Always use `formatPhoneNumber` before displaying phone numbers
2. **Clipboard**: Combine `useClipboard` with toast notifications for user feedback
3. **Sharing**: Handle both Web Share API success and clipboard fallback gracefully
4. **Error Handling**: All utilities include error handling - check console for debugging

---

## Contributing

When adding new utilities:

1. Create the utility file in `lib/utils/`
2. Add JSDoc comments with examples
3. Export TypeScript types
4. Write unit tests in `__tests__/`
5. Update this README
6. Add integration examples

---

## License

MIT - MindConnect Project
