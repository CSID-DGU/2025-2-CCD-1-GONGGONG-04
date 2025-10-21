# Integration Examples

This document shows how to integrate the utility functions and hooks into your components.

## Table of Contents
1. [CenterContactInfo Component](#centercontactinfo-component)
2. [CenterHeader Component](#centerheader-component)
3. [SearchBar Component](#searchbar-component)
4. [CenterCard Component](#centercard-component)

---

## CenterContactInfo Component

This component displays center contact information with copy-to-clipboard and map navigation features.

```typescript
'use client';

import { Phone, MapPin, Copy, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useClipboard } from '@/hooks/useClipboard';
import { formatPhoneNumber } from '@/lib/utils/formatPhoneNumber';
import { openKakaoMapDirections } from '@/lib/utils/kakaoMap';

interface CenterContactInfoProps {
  phone: string | null;
  roadAddress: string;
  lotNumberAddress?: string;
  latitude: number;
  longitude: number;
  centerName: string;
}

export function CenterContactInfo({
  phone,
  roadAddress,
  lotNumberAddress,
  latitude,
  longitude,
  centerName,
}: CenterContactInfoProps) {
  const { toast } = useToast();
  const { copied: phoneCopied, copy: copyPhone } = useClipboard();
  const { copied: addressCopied, copy: copyAddress } = useClipboard();

  // Format phone number for display
  const formattedPhone = formatPhoneNumber(phone);

  // Handle phone copy
  const handlePhoneCopy = async () => {
    if (!formattedPhone) return;

    await copyPhone(formattedPhone);
    toast({
      title: '전화번호가 복사되었습니다',
      duration: 2000,
    });
  };

  // Handle address copy
  const handleAddressCopy = async () => {
    await copyAddress(roadAddress);
    toast({
      title: '주소가 복사되었습니다',
      duration: 2000,
    });
  };

  // Handle directions button
  const handleDirections = () => {
    openKakaoMapDirections(latitude, longitude, centerName);
  };

  return (
    <div className="space-y-4">
      {/* Phone */}
      {formattedPhone && (
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-lavender-600" />
          <div className="flex-1">
            <a
              href={`tel:${formattedPhone}`}
              className="text-body hover:text-lavender-600 transition-colors"
            >
              {formattedPhone}
            </a>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePhoneCopy}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {phoneCopied ? '복사됨' : '복사'}
          </Button>
        </div>
      )}

      {/* Address */}
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-lavender-600 mt-1" />
        <div className="flex-1 space-y-1">
          <p className="text-body">{roadAddress}</p>
          {lotNumberAddress && (
            <p className="text-caption text-gray-500">
              (지번) {lotNumberAddress}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddressCopy}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {addressCopied ? '복사됨' : '복사'}
          </Button>
          <Button
            variant="lavender"
            size="sm"
            onClick={handleDirections}
            className="flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            길찾기
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Key Features:
- ✅ Phone number formatting with `formatPhoneNumber`
- ✅ Clipboard functionality with `useClipboard` hook
- ✅ Kakao Map integration with `openKakaoMapDirections`
- ✅ Toast notifications for user feedback
- ✅ Click-to-call functionality

---

## CenterHeader Component

This component displays the center name and provides share functionality.

```typescript
'use client';

import { Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { shareContent, getCenterShareUrl } from '@/lib/utils/share';
import { useState } from 'react';

interface CenterHeaderProps {
  centerId: number;
  centerName: string;
  category: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export function CenterHeader({
  centerId,
  centerName,
  category,
  isFavorite = false,
  onFavoriteToggle,
}: CenterHeaderProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const url = getCenterShareUrl(centerId);

      const shared = await shareContent({
        title: centerName,
        text: `${centerName} - 마음이음`,
        url,
      });

      if (!shared) {
        // Clipboard fallback was used
        toast({
          title: '링크가 복사되었습니다',
          description: '원하는 곳에 붙여넣기 하세요',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: '공유 실패',
        description: '다시 시도해주세요',
        variant: 'destructive',
        duration: 2000,
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-caption font-medium bg-lavender-100 text-lavender-700">
            {category}
          </span>
        </div>
        <h1 className="text-h1 font-bold text-gray-900">{centerName}</h1>
      </div>

      <div className="flex gap-2">
        {/* Favorite Button */}
        {onFavoriteToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onFavoriteToggle}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400'
              }`}
            />
          </Button>
        )}

        {/* Share Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          disabled={isSharing}
          aria-label="공유하기"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
```

### Key Features:
- ✅ Share functionality with Web Share API + clipboard fallback
- ✅ URL generation with `getCenterShareUrl`
- ✅ Loading state during share operation
- ✅ Error handling with toast notifications
- ✅ Favorite toggle functionality

---

## SearchBar Component

This component shows how to use phone formatting in search results.

```typescript
'use client';

import { Search, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatPhoneNumber } from '@/lib/utils/formatPhoneNumber';
import { useState } from 'react';

interface SearchResult {
  id: number;
  name: string;
  phone: string | null;
  address: string;
}

export function SearchBar() {
  const [results, setResults] = useState<SearchResult[]>([]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <Input
          placeholder="센터명, 지역으로 검색"
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      <div className="space-y-2">
        {results.map((result) => (
          <div
            key={result.id}
            className="p-4 border rounded-lg hover:border-lavender-500 cursor-pointer transition-colors"
          >
            <h3 className="text-h4 font-semibold mb-2">{result.name}</h3>
            <div className="space-y-1 text-caption text-gray-600">
              {result.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a
                    href={`tel:${formatPhoneNumber(result.phone)}`}
                    className="hover:text-lavender-600"
                  >
                    {formatPhoneNumber(result.phone)}
                  </a>
                </div>
              )}
              <p>{result.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Key Features:
- ✅ Phone formatting in search results
- ✅ Click-to-call links
- ✅ Accessible phone number display

---

## CenterCard Component

This component demonstrates phone formatting and share functionality in list items.

```typescript
'use client';

import { MapPin, Phone, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPhoneNumber } from '@/lib/utils/formatPhoneNumber';
import { shareContent, createCenterShareOptions } from '@/lib/utils/share';
import { useToast } from '@/hooks/use-toast';

interface CenterCardProps {
  id: number;
  name: string;
  category: string;
  phone: string | null;
  address: string;
  distance?: number;
  status: 'operating' | 'closed' | 'emergency';
}

export function CenterCard({
  id,
  name,
  category,
  phone,
  address,
  distance,
  status,
}: CenterCardProps) {
  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareOptions = createCenterShareOptions(id, name);
    const shared = await shareContent(shareOptions);

    if (!shared) {
      toast({
        title: '링크가 복사되었습니다',
        duration: 2000,
      });
    }
  };

  const statusConfig = {
    operating: { label: '운영중', className: 'bg-green-100 text-green-700' },
    closed: { label: '운영종료', className: 'bg-gray-100 text-gray-700' },
    emergency: { label: '24시간', className: 'bg-red-100 text-red-700' },
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{category}</Badge>
              <Badge className={statusConfig[status].className}>
                {statusConfig[status].label}
              </Badge>
            </div>
            <h3 className="text-h3 font-semibold">{name}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            aria-label="공유하기"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-caption">
        {phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <a
              href={`tel:${formatPhoneNumber(phone)}`}
              className="hover:text-lavender-600"
            >
              {formatPhoneNumber(phone)}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{address}</span>
        </div>

        {distance !== undefined && (
          <p className="text-gray-500">현재 위치에서 {distance}km</p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Key Features:
- ✅ Phone formatting with click-to-call
- ✅ Share functionality with helper `createCenterShareOptions`
- ✅ Status badges with dynamic styling
- ✅ Distance display
- ✅ Card hover effects

---

## Best Practices

### 1. Always Format Phone Numbers
```typescript
// ✅ Good
const formattedPhone = formatPhoneNumber(center.phone);
<a href={`tel:${formattedPhone}`}>{formattedPhone}</a>

// ❌ Bad
<a href={`tel:${center.phone}`}>{center.phone}</a>
```

### 2. Combine Clipboard with Toast Notifications
```typescript
// ✅ Good
const { copied, copy } = useClipboard();

const handleCopy = async () => {
  await copy(text);
  toast({ title: '복사되었습니다' });
};

// ❌ Bad - no user feedback
const handleCopy = async () => {
  await copy(text);
  // User doesn't know if copy succeeded
};
```

### 3. Handle Share Fallbacks
```typescript
// ✅ Good
const shared = await shareContent(options);
if (!shared) {
  toast({ title: '링크가 복사되었습니다' });
}

// ❌ Bad - ignore fallback case
await shareContent(options);
// Desktop users get no feedback
```

### 4. Provide Accessibility Labels
```typescript
// ✅ Good
<Button
  onClick={handleShare}
  aria-label="공유하기"
>
  <Share2 />
</Button>

// ❌ Bad - no screen reader support
<Button onClick={handleShare}>
  <Share2 />
</Button>
```

---

## Testing Integration

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CenterContactInfo } from './CenterContactInfo';

describe('CenterContactInfo', () => {
  it('should format and display phone number', () => {
    render(
      <CenterContactInfo
        phone="0212345678"
        roadAddress="서울시 중구"
        latitude={37.5665}
        longitude={126.9780}
        centerName="테스트 센터"
      />
    );

    expect(screen.getByText('02-1234-5678')).toBeInTheDocument();
  });

  it('should copy address to clipboard', async () => {
    render(
      <CenterContactInfo
        phone="0212345678"
        roadAddress="서울시 중구"
        latitude={37.5665}
        longitude={126.9780}
        centerName="테스트 센터"
      />
    );

    const copyButton = screen.getAllByText('복사')[0];
    fireEvent.click(copyButton);

    await screen.findByText('복사됨');
  });
});
```

---

## Environment Setup

Ensure your `.env.local` includes:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

And `.env.production`:

```bash
NEXT_PUBLIC_SITE_URL=https://mindconnect.com
```
