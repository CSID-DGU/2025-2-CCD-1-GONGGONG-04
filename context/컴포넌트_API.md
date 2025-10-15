# 마음이음 컴포넌트 API 문서

이 문서는 마음이음 프로젝트에서 사용 가능한 모든 컴포넌트들의 사용 방법을 안내합니다.

---

## 1. 기본 UI 컴포넌트 (shadcn 기반)

### 1.1 Accordion

**목적**: 접을 수 있는 아코디언 패널

**Props**:
```typescript
{
  type?: 'single' | 'multiple'  // 단일/다중 확장
  collapsible?: boolean          // 축소 가능 여부
  className?: string
}
```

**사용 예시**:
```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>FAQ 1</AccordionTrigger>
    <AccordionContent>답변 내용</AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### 1.2 Alert

**목적**: 경고 메시지 표시

**Props**:
```typescript
{
  variant?: 'default' | 'destructive'  // 변형 스타일
  className?: string
}
```

**사용 예시**:
```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>알림</AlertTitle>
  <AlertDescription>중요한 메시지입니다.</AlertDescription>
</Alert>
```

---

### 1.3 AlertDialog

**목적**: 확인/취소가 필요한 경고 대화상자

**Props**:
```typescript
{
  open?: boolean                        // 제어 모드
  onOpenChange?: (open: boolean) => void  // 상태 변경 콜백
}
```

**사용 예시**:
```tsx
<AlertDialog>
  <AlertDialogTrigger>삭제</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
      <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>취소</AlertDialogCancel>
      <AlertDialogAction>삭제</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### 1.4 AspectRatio

**목적**: 이미지나 비디오의 종횡비 유지

**Props**:
```typescript
{
  ratio?: number  // 종횡비 (예: 16/9)
}
```

**사용 예시**:
```tsx
<AspectRatio ratio={16 / 9}>
  <img src="/image.jpg" alt="이미지" className="object-cover" />
</AspectRatio>
```

---

### 1.5 Avatar

**목적**: 사용자 프로필 아바타

**Props**:
```typescript
{
  className?: string
}
```

**사용 예시**:
```tsx
<Avatar>
  <AvatarImage src="/avatar.jpg" alt="사용자" />
  <AvatarFallback>홍길동</AvatarFallback>
</Avatar>
```

---

### 1.6 Badge

**목적**: 상태나 카테고리를 표시하는 배지

**Props**:
```typescript
{
  variant?: 'default' | 'operating' | 'closed' | 'emergency' | 'secondary' | 'destructive'
  className?: string
  children: React.ReactNode
}
```

**사용 예시**:
```tsx
// 운영중 배지
<Badge variant="operating">운영중</Badge>

// 마감 배지
<Badge variant="closed">마감</Badge>

// 긴급 배지
<Badge variant="emergency">긴급</Badge>
```

---

### 1.7 Breadcrumb

**목적**: 계층적 네비게이션 경로 표시

**Props**:
```typescript
{
  className?: string
}
```

**사용 예시**:
```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">홈</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/centers">센터</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>상세</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

### 1.8 Button

**목적**: 사용자 액션을 위한 버튼 컴포넌트

**Props**:
```typescript
{
  variant?: 'default' | 'lavender' | 'operating' | 'emergency' | 'destructive' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'touch'
  className?: string
  onClick?: () => void
  children: React.ReactNode
}
```

**사용 예시**:
```tsx
// 기본 버튼
<Button>클릭하세요</Button>

// 라벤더 그라데이션 버튼
<Button variant="lavender">예약하기</Button>

// 모바일 터치 친화적 버튼
<Button size="touch">큰 버튼</Button>

// 운영 상태 버튼
<Button variant="operating">운영중</Button>
```

---

### 1.9 Calendar

**목적**: 날짜 선택 달력

**Props**:
```typescript
{
  mode?: 'single' | 'multiple' | 'range'  // 선택 모드
  selected?: Date | Date[]                // 선택된 날짜
  onSelect?: (date: Date | Date[]) => void  // 날짜 선택 콜백
  showOutsideDays?: boolean               // 이전/다음 월 날짜 표시 (기본값: true)
  disabled?: Date[]                       // 비활성화할 날짜
  className?: string
}
```

**사용 예시**:
```tsx
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={(date) => date < new Date()}
/>
```

---

### 1.10 Card

**목적**: 컨텐츠를 담는 카드 컨테이너

**Props**:
```typescript
{
  className?: string
  children: React.ReactNode
}
```

**사용 예시**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>
    카드 내용이 들어갑니다.
  </CardContent>
</Card>
```

---

### 1.11 Carousel

**목적**: 이미지/콘텐츠 캐러셀

**Props**:
```typescript
{
  opts?: {
    align?: 'start' | 'center' | 'end'  // 정렬
    loop?: boolean                       // 무한 루프
  }
  orientation?: 'horizontal' | 'vertical'  // 방향 (기본값: 'horizontal')
  className?: string
}
```

**사용 예시**:
```tsx
<Carousel opts={{ loop: true }}>
  <CarouselContent>
    <CarouselItem>슬라이드 1</CarouselItem>
    <CarouselItem>슬라이드 2</CarouselItem>
    <CarouselItem>슬라이드 3</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

---

### 1.12 Chart

**목적**: 차트 시각화

**Props**:
```typescript
{
  config: {
    [key: string]: {
      label?: React.ReactNode    // 레이블
      color?: string             // 색상
      icon?: ComponentType       // 아이콘
    }
  }
  className?: string
}
```

**사용 예시**:
```tsx
<ChartContainer config={{
  visitors: { label: "방문자", color: "hsl(var(--chart-1))" }
}}>
  <BarChart data={data}>
    <Bar dataKey="visitors" fill="var(--color-visitors)" />
  </BarChart>
</ChartContainer>
```

---

### 1.13 Checkbox

**목적**: 체크박스 입력

**Props**:
```typescript
{
  checked?: boolean                        // 체크 상태
  onCheckedChange?: (checked: boolean) => void  // 상태 변경 콜백
  disabled?: boolean                       // 비활성화 여부
  className?: string
}
```

**사용 예시**:
```tsx
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">약관에 동의합니다</Label>
</div>
```

---

### 1.14 Collapsible

**목적**: 접을 수 있는 영역

**Props**:
```typescript
{
  open?: boolean                         // 확장 상태
  onOpenChange?: (open: boolean) => void  // 상태 변경 콜백
  className?: string
}
```

**사용 예시**:
```tsx
<Collapsible>
  <CollapsibleTrigger>더 보기</CollapsibleTrigger>
  <CollapsibleContent>
    숨겨진 내용이 여기에 표시됩니다.
  </CollapsibleContent>
</Collapsible>
```

---

### 1.15 Command

**목적**: 커맨드 팔레트 (검색 및 명령 실행)

**Props**:
```typescript
{
  className?: string
}
```

**사용 예시**:
```tsx
<Command>
  <CommandInput placeholder="검색..." />
  <CommandList>
    <CommandEmpty>결과 없음</CommandEmpty>
    <CommandGroup heading="제안">
      <CommandItem>상담 예약</CommandItem>
      <CommandItem>센터 찾기</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

---

### 1.16 ContextMenu

**목적**: 컨텍스트 메뉴 (우클릭 메뉴)

**Props**:
```typescript
{
  className?: string
}
```

**사용 예시**:
```tsx
<ContextMenu>
  <ContextMenuTrigger>우클릭하세요</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>복사</ContextMenuItem>
    <ContextMenuItem>붙여넣기</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem variant="destructive">삭제</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

---

### 1.17 Dialog

**목적**: 모달 대화상자

**Props**:
```typescript
{
  open?: boolean                        // 제어 모드
  onOpenChange?: (open: boolean) => void  // 상태 변경 콜백
}
```

**사용 예시**:
```tsx
<Dialog>
  <DialogTrigger>열기</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>제목</DialogTitle>
      <DialogDescription>설명</DialogDescription>
    </DialogHeader>
    {/* 콘텐츠 */}
    <DialogFooter>
      <Button>확인</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 1.18 Drawer

**목적**: 하단/측면 드로어

**Props**:
```typescript
{
  open?: boolean                        // 제어 모드
  onOpenChange?: (open: boolean) => void  // 상태 변경 콜백
}
```

**사용 예시**:
```tsx
<Drawer>
  <DrawerTrigger>열기</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>제목</DrawerTitle>
      <DrawerDescription>설명</DrawerDescription>
    </DrawerHeader>
    {/* 콘텐츠 */}
    <DrawerFooter>
      <Button>확인</Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

---

### 1.19 DropdownMenu

**목적**: 드롭다운 메뉴

**Props**:
```typescript
{
  open?: boolean                        // 제어 모드
  onOpenChange?: (open: boolean) => void  // 상태 변경 콜백
}
```

**사용 예시**:
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>메뉴</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>프로필</DropdownMenuItem>
    <DropdownMenuItem>설정</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">로그아웃</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 1.20 Form

**목적**: 폼 관리 (react-hook-form 통합)

**Props**:
```typescript
{
  // react-hook-form의 useForm 반환값 사용
}
```

**사용 예시**:
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>이메일</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

### 1.21 HoverCard

**목적**: 호버 시 카드 표시

**Props**:
```typescript
{
  openDelay?: number     // 오픈 지연 시간 (ms)
  closeDelay?: number    // 닫기 지연 시간 (ms)
}
```

**사용 예시**:
```tsx
<HoverCard>
  <HoverCardTrigger>호버하세요</HoverCardTrigger>
  <HoverCardContent>
    추가 정보가 여기에 표시됩니다.
  </HoverCardContent>
</HoverCard>
```

---

### 1.22 Input

**목적**: 텍스트 입력 필드

**Props**:
```typescript
{
  type?: string          // input 타입
  placeholder?: string   // 플레이스홀더
  value?: string         // 제어 값
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void  // 변경 콜백
  disabled?: boolean     // 비활성화 여부
  className?: string
}
```

**사용 예시**:
```tsx
<Input
  type="email"
  placeholder="이메일을 입력하세요"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

---

### 1.23 InputOTP

**목적**: OTP(일회용 비밀번호) 입력

**Props**:
```typescript
{
  maxLength: number      // OTP 자릿수 (필수)
  value?: string         // 제어 값
  onChange?: (value: string) => void  // 변경 콜백
}
```

**사용 예시**:
```tsx
<InputOTP maxLength={6} value={otp} onChange={setOtp}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

---

### 1.24 Label

**목적**: 폼 레이블

**Props**:
```typescript
{
  htmlFor?: string       // 연결할 input ID
  className?: string
}
```

**사용 예시**:
```tsx
<Label htmlFor="email">이메일</Label>
<Input id="email" type="email" />
```

---

### 1.25 Menubar

**목적**: 수평 메뉴바 (데스크톱 앱 스타일)

**Props**:
```typescript
{
  className?: string
}
```

**사용 예시**:
```tsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>파일</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>새 파일</MenubarItem>
      <MenubarItem>열기</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>저장</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>편집</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>복사</MenubarItem>
      <MenubarItem>붙여넣기</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

---

### 1.26 NavigationMenu

**목적**: 복잡한 네비게이션 메뉴 구조

**Props**:
```typescript
{
  className?: string
}
```

**사용 예시**:
```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>서비스</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/counseling">상담</NavigationMenuLink>
        <NavigationMenuLink href="/booking">예약</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

---

### 1.27 Pagination

**목적**: 페이지네이션 UI

**Props**:
```typescript
{
  className?: string
}
```

**사용 예시**:
```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

---

### 1.28 Popover

**목적**: 경량 팝오버

**Props**:
```typescript
{
  open?: boolean                        // 제어 모드
  onOpenChange?: (open: boolean) => void  // 상태 변경 콜백
}
```

**사용 예시**:
```tsx
<Popover>
  <PopoverTrigger>열기</PopoverTrigger>
  <PopoverContent>
    팝오버 내용이 여기에 표시됩니다.
  </PopoverContent>
</Popover>
```

---

### 1.29 Progress

**목적**: 진행 표시줄

**Props**:
```typescript
{
  value?: number         // 진행률 (0-100)
  className?: string
}
```

**사용 예시**:
```tsx
<Progress value={66} />
```

---

### 1.30 RadioGroup

**목적**: 라디오 버튼 그룹

**Props**:
```typescript
{
  value?: string                       // 선택된 값
  onValueChange?: (value: string) => void  // 값 변경 콜백
  className?: string
}
```

**사용 예시**:
```tsx
<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <Label htmlFor="option1">옵션 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="option2" />
    <Label htmlFor="option2">옵션 2</Label>
  </div>
</RadioGroup>
```

---

### 1.31 Resizable

**목적**: 크기 조정 가능한 패널 레이아웃

**Props**:
```typescript
{
  direction?: 'horizontal' | 'vertical'  // 방향
  className?: string
}
```

**사용 예시**:
```tsx
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={50}>패널 1</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={50}>패널 2</ResizablePanel>
</ResizablePanelGroup>
```

---

### 1.32 ScrollArea

**목적**: 커스텀 스크롤 영역

**Props**:
```typescript
{
  className?: string
}
```

**사용 예시**:
```tsx
<ScrollArea className="h-72">
  <div className="p-4">
    긴 콘텐츠가 여기에...
  </div>
</ScrollArea>
```

---

### 1.33 Select

**목적**: 드롭다운 선택 메뉴

**Props**:
```typescript
{
  value?: string                       // 선택된 값
  onValueChange?: (value: string) => void  // 값 변경 콜백
  disabled?: boolean                   // 비활성화 여부
}
```

**사용 예시**:
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="선택하세요" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">옵션 1</SelectItem>
    <SelectItem value="option2">옵션 2</SelectItem>
    <SelectItem value="option3">옵션 3</SelectItem>
  </SelectContent>
</Select>
```

---

### 1.34 Separator

**목적**: 시각적 구분선 제공

**Props**:
```typescript
{
  orientation?: 'horizontal' | 'vertical'  // 방향 (기본값: 'horizontal')
  decorative?: boolean                     // 장식용 여부 (기본값: true)
  className?: string
}
```

**사용 예시**:
```tsx
<div>
  <p>콘텐츠 1</p>
  <Separator className="my-4" />
  <p>콘텐츠 2</p>
</div>
```

---

### 1.35 Sheet

**목적**: 슬라이드인 패널

**Props**:
```typescript
{
  side?: 'top' | 'right' | 'bottom' | 'left'  // 슬라이드 방향 (기본값: 'right')
  open?: boolean                              // 제어 모드
  onOpenChange?: (open: boolean) => void      // 상태 변경 콜백
}
```

**사용 예시**:
```tsx
<Sheet>
  <SheetTrigger>열기</SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>제목</SheetTitle>
      <SheetDescription>설명</SheetDescription>
    </SheetHeader>
    {/* 콘텐츠 */}
  </SheetContent>
</Sheet>
```

---

### 1.36 Sidebar

**목적**: 복잡한 사이드바 레이아웃

**Props**:
```typescript
{
  side?: 'left' | 'right'                                // 위치 (기본값: 'left')
  variant?: 'sidebar' | 'floating' | 'inset'             // 변형 (기본값: 'sidebar')
  collapsible?: 'offcanvas' | 'icon' | 'none'            // 축소 모드 (기본값: 'offcanvas')
  defaultOpen?: boolean                                   // 기본 열림 상태 (기본값: true)
}
```

**사용 예시**:
```tsx
<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <h2>마음이음</h2>
    </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Home />
            <span>홈</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    <main>메인 콘텐츠</main>
  </SidebarInset>
</SidebarProvider>
```

---

### 1.37 Skeleton

**목적**: 로딩 스켈레톤

**Props**:
```typescript
{
  className?: string
}
```

**사용 예시**:
```tsx
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

---

### 1.38 Slider

**목적**: 슬라이더 입력

**Props**:
```typescript
{
  min?: number              // 최소값 (기본값: 0)
  max?: number              // 최대값 (기본값: 100)
  step?: number             // 스텝
  value?: number[]          // 제어 값
  onValueChange?: (value: number[]) => void  // 값 변경 콜백
  className?: string
}
```

**사용 예시**:
```tsx
<Slider
  min={0}
  max={100}
  step={1}
  value={[value]}
  onValueChange={([v]) => setValue(v)}
/>
```

---

### 1.39 Switch

**목적**: 토글 스위치

**Props**:
```typescript
{
  checked?: boolean                        // 체크 상태
  onCheckedChange?: (checked: boolean) => void  // 상태 변경 콜백
  disabled?: boolean                       // 비활성화 여부
  className?: string
}
```

**사용 예시**:
```tsx
<div className="flex items-center space-x-2">
  <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
  <Label htmlFor="notifications">알림 받기</Label>
</div>
```

---

### 1.40 Table

**목적**: 데이터 테이블

**Props**:
```typescript
{
  className?: string
}
```

**사용 예시**:
```tsx
<Table>
  <TableCaption>센터 목록</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>이름</TableHead>
      <TableHead>주소</TableHead>
      <TableHead>상태</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>서울센터</TableCell>
      <TableCell>서울시 강남구</TableCell>
      <TableCell>운영중</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### 1.41 Tabs

**목적**: 탭 인터페이스

**Props**:
```typescript
{
  value?: string                       // 현재 탭
  onValueChange?: (value: string) => void  // 탭 변경 콜백
  className?: string
}
```

**사용 예시**:
```tsx
<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="tab1">탭 1</TabsTrigger>
    <TabsTrigger value="tab2">탭 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">탭 1 콘텐츠</TabsContent>
  <TabsContent value="tab2">탭 2 콘텐츠</TabsContent>
</Tabs>
```

---

### 1.42 Textarea

**목적**: 여러 줄 텍스트 입력

**Props**:
```typescript
{
  placeholder?: string   // 플레이스홀더
  value?: string         // 제어 값
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void  // 변경 콜백
  rows?: number          // 행 수
  className?: string
}
```

**사용 예시**:
```tsx
<Textarea
  placeholder="메시지를 입력하세요"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={4}
/>
```

---

### 1.43 Toast

**목적**: 알림 토스트

**Props**:
```typescript
{
  variant?: 'default' | 'destructive'  // 변형 스타일
}
```

**사용 예시**:
```tsx
// useToast 훅 사용
const { toast } = useToast();

toast({
  title: "알림",
  description: "작업이 완료되었습니다.",
  variant: "default"
});

toast({
  title: "오류",
  description: "문제가 발생했습니다.",
  variant: "destructive"
});
```

---

### 1.44 Toggle

**목적**: 토글 버튼

**Props**:
```typescript
{
  variant?: 'default' | 'outline'      // 변형 (기본값: 'default')
  size?: 'default' | 'sm' | 'lg'       // 크기 (기본값: 'default')
  pressed?: boolean                     // 눌림 상태
  onPressedChange?: (pressed: boolean) => void  // 상태 변경 콜백
  className?: string
}
```

**사용 예시**:
```tsx
<Toggle pressed={bold} onPressedChange={setBold}>
  <Bold className="h-4 w-4" />
</Toggle>
```

---

### 1.45 ToggleGroup

**목적**: 토글 버튼 그룹

**Props**:
```typescript
{
  type: 'single' | 'multiple'          // 선택 타입 (필수)
  value?: string | string[]             // 선택된 값
  onValueChange?: (value: string | string[]) => void  // 값 변경 콜백
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}
```

**사용 예시**:
```tsx
<ToggleGroup type="single" value={align} onValueChange={setAlign}>
  <ToggleGroupItem value="left">
    <AlignLeft className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="center">
    <AlignCenter className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="right">
    <AlignRight className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

---

### 1.46 Tooltip

**목적**: 간단한 툴팁

**Props**:
```typescript
{
  delayDuration?: number  // 지연 시간 (ms, 기본값: 0)
}
```

**사용 예시**:
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>호버하세요</TooltipTrigger>
    <TooltipContent>
      <p>툴팁 내용</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## 2. 합성 컴포넌트

### 2.1 CenterCard

**목적**: 센터 정보를 표시하는 카드 컴포넌트

**Props**:
```typescript
{
  name: string           // 센터 이름
  category: string       // 센터 카테고리
  address: string        // 센터 주소
  isOperating: boolean   // 운영 여부
  distance?: string      // 거리 (선택)
  rating?: number        // 평점 (선택)
}
```

**사용 예시**:
```tsx
<CenterCard
  name="서울시립청소년상담복지센터"
  category="청소년상담"
  address="서울시 중구 세종대로 21"
  isOperating={true}
  distance="1.2km"
  rating={4.5}
/>
```

---

### 2.2 SearchBar

**목적**: 센터 검색을 위한 검색바

**Props**:
```typescript
{
  placeholder?: string                      // 검색창 플레이스홀더
  onSearch: (query: string) => void        // 검색 실행 콜백
  onLocationChange?: (location: string) => void  // 위치 변경 콜백
}
```

**사용 예시**:
```tsx
<SearchBar
  placeholder="센터 이름이나 서비스를 검색하세요"
  onSearch={(query) => console.log('검색:', query)}
  onLocationChange={(location) => console.log('위치 변경:', location)}
/>
```

---

### 2.3 QuickAccessGrid

**목적**: 주요 기능에 빠르게 접근할 수 있는 그리드

**Props**:
```typescript
{
  items: QuickAccessItem[]  // 빠른 접근 아이템 배열
}

// QuickAccessItem 타입:
{
  icon: React.ReactNode   // 아이콘
  label: string          // 라벨 텍스트
  href: string          // 링크 URL
  color?: string        // Tailwind 색상 클래스
}
```

**사용 예시**:
```tsx
<QuickAccessGrid
  items={[
    { icon: <Phone />, label: '긴급전화', href: '/emergency', color: 'bg-red-500' },
    { icon: <Calendar />, label: '예약', href: '/booking', color: 'bg-blue-500' },
    { icon: <MessageCircle />, label: '상담', href: '/counseling', color: 'bg-green-500' },
  ]}
/>
```

---

### 2.4 OperatingStatus

**목적**: 센터의 운영 상태를 표시

**Props**:
```typescript
{
  openTime: string       // 오픈 시간 (예: "09:00")
  closeTime: string      // 마감 시간 (예: "18:00")
  holidayInfo?: string   // 휴무일 정보
  size?: 'sm' | 'md' | 'lg'  // 크기
}
```

**사용 예시**:
```tsx
<OperatingStatus
  openTime="09:00"
  closeTime="18:00"
  holidayInfo="토요일, 일요일"
  size="md"
/>
```

---

### 2.5 CenterMap

**목적**: 센터 위치를 지도에 표시

**Props**:
```typescript
{
  centers: Center[]                        // 표시할 센터 목록
  userLocation?: Coordinates               // 사용자 위치
  onCenterSelect: (center: Center) => void // 센터 선택 콜백
}

// Center 타입:
{
  id: string
  name: string
  latitude: number
  longitude: number
  // ... 기타 센터 정보
}

// Coordinates 타입:
{
  latitude: number
  longitude: number
}
```

**사용 예시**:
```tsx
<CenterMap
  centers={centerList}
  userLocation={{ latitude: 37.5665, longitude: 126.9780 }}
  onCenterSelect={(center) => console.log('선택된 센터:', center)}
/>
```

---

## 3. 순수 커스텀 컴포넌트

### 3.1 ThemeProvider

**목적**: Next.js 애플리케이션의 다크/라이트 테마 관리

**Props**:
```typescript
{
  attribute?: string              // 테마 속성 (기본값: 'class')
  defaultTheme?: string           // 기본 테마 (기본값: 'system')
  enableSystem?: boolean          // 시스템 테마 사용 (기본값: true)
  disableTransitionOnChange?: boolean  // 테마 전환 애니메이션 비활성화
  children: React.ReactNode
}
```

**사용 예시**:
```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationMismatch>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

### 3.2 PromotionalSection

**목적**: 홍보 섹션 카드 (긴급전화, 상담 예약 등)

**Props**:
```typescript
{
  title: string                    // 카드 제목
  description: string              // 카드 설명
  buttonText: string               // 버튼 텍스트
  buttonVariant?: 'default' | 'lavender' | 'operating' | 'emergency'  // 버튼 스타일
  icon?: React.ReactNode           // 아이콘 (선택)
  href?: string                    // 링크 URL (선택)
  onClick?: () => void             // 클릭 콜백 (선택)
  className?: string
}
```

**사용 예시**:
```tsx
<div className="grid md:grid-cols-2 gap-4">
  <PromotionalSection
    title="24시간 긴급전화"
    description="위기 상황 시 언제든지 연락하세요"
    buttonText="1388 전화하기"
    buttonVariant="emergency"
    icon={<Phone className="h-5 w-5" />}
    href="tel:1388"
  />

  <PromotionalSection
    title="온라인 상담 예약"
    description="편리한 시간에 상담을 예약하세요"
    buttonText="예약하기"
    buttonVariant="lavender"
    icon={<Calendar className="h-5 w-5" />}
    href="/booking"
  />
</div>
```

---

### 3.3 HeroBanner

**목적**: 메인 페이지 히어로 배너

**Props**:
```typescript
{
  title: string                    // 메인 제목
  subtitle?: string                // 부제목 (선택)
  description: string              // 설명 텍스트
  primaryAction?: {
    text: string                   // 주 버튼 텍스트
    href?: string                  // 링크 URL
    onClick?: () => void           // 클릭 콜백
  }
  secondaryAction?: {
    text: string                   // 보조 버튼 텍스트
    href?: string                  // 링크 URL
    onClick?: () => void           // 클릭 콜백
  }
  backgroundImage?: string         // 배경 이미지 URL (선택)
  gradient?: boolean               // 라벤더 그라데이션 배경 (기본값: true)
  className?: string
}
```

**사용 예시**:
```tsx
<HeroBanner
  title="마음이음"
  subtitle="당신의 마음을 이어주는 상담 플랫폼"
  description="전국의 청소년상담복지센터와 Wee센터를 쉽게 찾고 예약하세요"
  primaryAction={{
    text: "센터 찾기",
    href: "/search"
  }}
  secondaryAction={{
    text: "긴급 상담",
    href: "/emergency"
  }}
  gradient={true}
/>
```

---

### 3.4 Header

**목적**: 앱 상단 헤더 (네비게이션 및 사용자 메뉴)

**Props**:
```typescript
{
  user?: {
    name: string                   // 사용자 이름
    email?: string                 // 이메일 (선택)
    avatar?: string                // 아바타 이미지 URL (선택)
  }
  navigationItems?: NavItem[]      // 네비게이션 아이템 (선택)
  onLogin?: () => void             // 로그인 콜백
  onLogout?: () => void            // 로그아웃 콜백
  showThemeToggle?: boolean        // 테마 토글 표시 (기본값: true)
  className?: string
}

// NavItem 타입:
{
  label: string                    // 라벨
  href: string                     // 링크 URL
  icon?: React.ReactNode           // 아이콘 (선택)
}
```

**사용 예시**:
```tsx
<Header
  user={{
    name: "홍길동",
    email: "hong@example.com",
    avatar: "/avatar.jpg"
  }}
  navigationItems={[
    { label: "홈", href: "/", icon: <Home /> },
    { label: "센터 찾기", href: "/search", icon: <Search /> },
    { label: "예약", href: "/booking", icon: <Calendar /> },
    { label: "내 정보", href: "/profile", icon: <User /> }
  ]}
  onLogout={() => console.log("로그아웃")}
  showThemeToggle={true}
/>
```

---

### 3.5 IconButton

**목적**: 아이콘과 라벨이 있는 터치 친화적 버튼

**Props**:
```typescript
{
  icon: React.ReactNode     // 아이콘
  label: string            // 라벨 텍스트
  onClick?: () => void     // 클릭 콜백
  className?: string       // 추가 스타일
  gradient?: boolean       // 그라데이션 효과 여부
}
```

**사용 예시**:
```tsx
<IconButton
  icon={<Phone />}
  label="전화하기"
  onClick={() => console.log('전화하기')}
  gradient={true}
/>
```

---

### 3.6 BottomNavigation

**목적**: 모바일 하단 네비게이션 바

**Props**:
```typescript
{
  items: NavItem[]  // 네비게이션 아이템 배열
}

// NavItem 타입:
{
  icon: React.ReactNode   // 아이콘
  label: string          // 라벨
  href: string          // 링크 URL
  badge?: number        // 알림 배지 숫자
}
```

**사용 예시**:
```tsx
<BottomNavigation
  items={[
    { icon: <Home />, label: '홈', href: '/' },
    { icon: <Search />, label: '검색', href: '/search' },
    { icon: <Heart />, label: '찜', href: '/favorites', badge: 3 },
    { icon: <User />, label: '내 정보', href: '/profile' },
  ]}
/>
```

---

### 3.7 LocationSelector

**목적**: 현재 위치를 선택하는 드롭다운

**Props**:
```typescript
{
  currentLocation: string              // 현재 선택된 위치
  locations: string[]                  // 선택 가능한 위치 목록
  onLocationChange: (location: string) => void  // 위치 변경 콜백
}
```

**사용 예시**:
```tsx
<LocationSelector
  currentLocation="서울시 강남구"
  locations={['서울시 강남구', '서울시 서초구', '서울시 송파구']}
  onLocationChange={(location) => console.log('위치 변경:', location)}
/>
```

---

### 3.8 FilterPanel

**목적**: 센터 검색 필터 패널

**Props**:
```typescript
{
  filters: FilterOptions              // 현재 필터 옵션
  onFilterChange: (filters: FilterOptions) => void  // 필터 변경 콜백
  onApply: () => void                // 필터 적용 콜백
  onReset: () => void                // 필터 초기화 콜백
}

// FilterOptions 타입:
{
  categories?: string[]    // 선택된 카테고리
  distance?: number       // 거리 (km)
  openNow?: boolean      // 현재 운영중만
  rating?: number        // 최소 평점
}
```

**사용 예시**:
```tsx
<FilterPanel
  filters={{
    categories: ['청소년상담', '가족상담'],
    distance: 5,
    openNow: true,
    rating: 4.0
  }}
  onFilterChange={(filters) => setFilters(filters)}
  onApply={() => console.log('필터 적용')}
  onReset={() => console.log('필터 초기화')}
/>
```

---

## 4. 스타일 가이드

### 4.1 색상 사용

**Primary Actions**:
- `bg-lavender-500` 또는 `gradient-lavender`
- 주요 액션 버튼, 강조 요소

**Secondary Actions**:
- `bg-lavender-100` with `text-lavender-700`
- 보조 버튼, 서브 액션

**상태 표시**:
- 운영중: `bg-status-operating` (녹색 계열)
- 마감: `bg-status-closed` (회색 계열)
- 긴급: `bg-status-emergency` (빨강 계열)

**CSS 변수**:
```css
--background: 0 0% 100%
--foreground: 240 10% 3.9%
--primary: 240 5.9% 10%
--primary-foreground: 0 0% 98%
--lavender-500: 264 83% 72%
--status-operating: 142 76% 36%
--status-closed: 240 5% 65%
--status-emergency: 0 84% 60%
```

### 4.2 간격 규칙

**컴포넌트 간격**:
- `gap-4` (16px) - 그리드 아이템 간격
- `space-x-4` / `space-y-4` - 수평/수직 간격

**섹션 간격**:
- `space-y-6` (24px) - 섹션 간 간격
- `space-y-8` (32px) - 큰 섹션 간격

**카드 내부 패딩**:
- `p-4` (16px) - 기본 패딩
- `p-6` (24px) - 여유있는 패딩

**터치 타겟**:
- 최소 `44x44px` (모바일 접근성)
- `size="touch"` prop 사용

### 4.3 반응형 브레이크포인트

- `sm:` (640px) - 태블릿
- `md:` (768px) - 작은 데스크톱
- `lg:` (1024px) - 데스크톱
- `xl:` (1280px) - 큰 데스크톱

**사용 예시**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>
```

### 4.4 타이포그래피

**제목**:
- `text-3xl` / `text-4xl` - 페이지 제목
- `text-2xl` - 섹션 제목
- `text-xl` - 서브섹션 제목

**본문**:
- `text-base` (16px) - 기본 텍스트
- `text-sm` (14px) - 보조 텍스트
- `text-xs` (12px) - 캡션, 라벨

**폰트 굵기**:
- `font-bold` - 제목, 강조
- `font-semibold` - 서브 제목
- `font-medium` - 레이블
- `font-normal` - 본문

### 4.5 그림자 및 둥근 모서리

**그림자**:
- `shadow-sm` - 미묘한 그림자
- `shadow-md` - 기본 그림자
- `shadow-lg` - 강한 그림자

**둥근 모서리**:
- `rounded-lg` (8px) - 기본
- `rounded-xl` (12px) - 카드
- `rounded-full` - 원형 (아바타, 배지)

---

## 5. 접근성 가이드라인

### 5.1 키보드 네비게이션

**필수 지원**:
- `Tab` / `Shift+Tab`: 포커스 이동
- `Enter` / `Space`: 버튼/링크 활성화
- `Escape`: 모달/드롭다운 닫기
- `Arrow Keys`: 메뉴/리스트 네비게이션

**구현 예시**:
```tsx
<Button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  클릭
</Button>
```

### 5.2 ARIA 속성

**필수 ARIA 속성**:
- `aria-label`: 텍스트가 없는 버튼
- `aria-labelledby`: 관련 레이블 참조
- `aria-describedby`: 추가 설명 참조
- `aria-hidden`: 장식 요소 숨김
- `aria-live`: 동적 콘텐츠 알림
- `aria-expanded`: 확장 가능 요소 상태
- `aria-current`: 현재 활성 항목

**구현 예시**:
```tsx
<button aria-label="검색" aria-expanded={isOpen}>
  <Search />
</button>

<nav aria-label="주요 네비게이션">
  <a href="/" aria-current="page">홈</a>
</nav>
```

### 5.3 포커스 관리

**포커스 표시**:
- `focus-visible:ring-2` - 포커스 링
- `focus-visible:ring-lavender-500` - 테마 색상
- `focus-visible:outline-none` - 기본 아웃라인 제거

**포커스 트랩**:
- 모달/다이얼로그에서 포커스 갇히기
- `Escape`로 닫을 때 원래 요소로 포커스 복귀

**구현 예시**:
```tsx
<Button className="focus-visible:ring-2 focus-visible:ring-lavender-500">
  액션
</Button>
```

### 5.4 스크린 리더

**스크린 리더 전용 텍스트**:
- `sr-only` 클래스 사용
- 시각적으로 숨김, 스크린 리더는 읽음

**의미론적 HTML**:
- `<nav>`, `<main>`, `<header>`, `<footer>` 사용
- `<h1>` ~ `<h6>` 계층 구조 유지
- `<button>` vs `<a>` 올바른 사용

**구현 예시**:
```tsx
<button>
  <Search />
  <span className="sr-only">검색</span>
</button>

<nav aria-label="주요 네비게이션">
  <ul>
    <li><a href="/">홈</a></li>
  </ul>
</nav>
```

### 5.5 색상 대비

**WCAG AA 기준**:
- 일반 텍스트: 4.5:1 이상
- 큰 텍스트(18px+): 3:1 이상
- UI 컴포넌트: 3:1 이상

**다크 모드 지원**:
- `dark:` prefix 사용
- CSS 변수로 테마 색상 관리
- ThemeProvider로 시스템 테마 감지

**구현 예시**:
```tsx
<p className="text-foreground dark:text-foreground">
  충분한 대비를 가진 텍스트
</p>
```

### 5.6 터치 타겟

**최소 크기**:
- 모바일: 44x44px (iOS 권장)
- 데스크톱: 24x24px

**적절한 간격**:
- 터치 타겟 간 8px 이상 간격
- `gap-2` 이상 사용

**구현 예시**:
```tsx
<Button size="touch" className="min-w-[44px] min-h-[44px]">
  클릭
</Button>
```

### 5.7 폼 접근성

**레이블 연결**:
- 모든 input에 `<Label>` 연결
- `htmlFor` / `id` 매칭

**오류 메시지**:
- `aria-invalid` 속성 사용
- `aria-describedby`로 오류 메시지 연결
- 시각적 + 텍스트 오류 표시

**구현 예시**:
```tsx
<div>
  <Label htmlFor="email">이메일</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && (
    <p id="email-error" className="text-destructive text-sm">
      {error}
    </p>
  )}
</div>
```

### 5.8 동적 콘텐츠 알림

**라이브 리전**:
- `aria-live="polite"`: 중요하지 않은 업데이트
- `aria-live="assertive"`: 중요한 업데이트
- Toast/Alert에 자동 적용

**구현 예시**:
```tsx
<div aria-live="polite" aria-atomic="true">
  {status && <p>{status}</p>}
</div>
```

---

## 6. 컴포넌트 선택 가이드

### 6.1 버튼 선택

| 사용 사례 | 컴포넌트 | 이유 |
|---------|---------|------|
| 기본 액션 | `Button` | 표준 버튼 |
| 아이콘 + 레이블 | `IconButton` | 터치 친화적 |
| 토글 | `Toggle` / `Switch` | 온/오프 상태 |
| 선택 그룹 | `ToggleGroup` / `RadioGroup` | 다중 옵션 |

### 6.2 오버레이 선택

| 사용 사례 | 컴포넌트 | 이유 |
|---------|---------|------|
| 확인 필요 | `AlertDialog` | 중요한 결정 |
| 폼/콘텐츠 | `Dialog` | 일반 모달 |
| 측면 패널 | `Sheet` | 슬라이드 패널 |
| 하단 패널 | `Drawer` | 모바일 친화적 |
| 간단한 정보 | `Popover` / `Tooltip` | 경량 오버레이 |

### 6.3 네비게이션 선택

| 사용 사례 | 컴포넌트 | 이유 |
|---------|---------|------|
| 모바일 하단 | `BottomNavigation` | 터치 친화적 |
| 데스크톱 사이드 | `Sidebar` | 복잡한 메뉴 |
| 상단 메뉴 | `Header` / `NavigationMenu` | 주요 네비게이션 |
| 드롭다운 | `DropdownMenu` | 숨김 메뉴 |

### 6.4 입력 선택

| 사용 사례 | 컴포넌트 | 이유 |
|---------|---------|------|
| 텍스트 | `Input` | 한 줄 입력 |
| 여러 줄 | `Textarea` | 긴 텍스트 |
| 선택 | `Select` / `RadioGroup` | 옵션 선택 |
| 범위 | `Slider` | 수치 범위 |
| 날짜 | `Calendar` | 날짜 선택 |
| OTP | `InputOTP` | 인증 코드 |

---

## 7. 성능 최적화

### 7.1 코드 스플리팅

**동적 import 사용**:
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton className="h-20" />
});
```

### 7.2 메모이제이션

**React.memo 사용**:
```tsx
import { memo } from 'react';

const CenterCard = memo(({ name, address }) => {
  // 컴포넌트 로직
});
```

### 7.3 가상화

**긴 리스트 최적화**:
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// ScrollArea와 함께 사용
<ScrollArea className="h-[400px]">
  {virtualItems.map(virtualItem => (
    <div key={virtualItem.key}>
      {/* 아이템 */}
    </div>
  ))}
</ScrollArea>
```

---

## 문서 버전

**최종 업데이트**: 2025-10-14
**컴포넌트 수**: 58개
**문서 버전**: 2.0.0
