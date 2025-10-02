import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestComponentsPage() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-12 font-korean">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-h1 mb-8 text-center">마음이음 컴포넌트 테스트</h1>

        {/* Button 컴포넌트 테스트 */}
        <section className="space-y-6">
          <h2 className="text-h2 border-b pb-2">Button 컴포넌트</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-h3 mb-3">Variants (변형)</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default Button</Button>
                <Button variant="lavender">Lavender Gradient</Button>
                <Button variant="operating">운영중</Button>
                <Button variant="emergency">긴급</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div>
              <h3 className="text-h3 mb-3">Sizes (크기)</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="touch">Touch (모바일)</Button>
                <Button size="icon">🔍</Button>
              </div>
            </div>

            <div>
              <h3 className="text-h3 mb-3">조합 예시</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="lavender" size="lg">큰 라벤더 버튼</Button>
                <Button variant="operating" size="touch">운영중 (터치)</Button>
                <Button variant="emergency" size="sm">긴급 알림</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Card 컴포넌트 테스트 */}
        <section className="space-y-6">
          <h2 className="text-h2 border-b pb-2">Card 컴포넌트</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>기본 카드</CardTitle>
                <CardDescription>shadow-soft와 hover:shadow-card 효과</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body">
                  이 카드에 마우스를 올리면 그림자가 커집니다.
                  transition-shadow duration-200 효과가 적용되어 부드럽게 전환됩니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>센터 정보 카드</CardTitle>
                <CardDescription>실제 사용 예시</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-body font-medium">마음건강센터</span>
                  <Badge variant="operating">운영중</Badge>
                </div>
                <p className="text-small text-muted-foreground">
                  서울시 강남구 테헤란로 123
                </p>
                <Button variant="lavender" size="sm" className="w-full">
                  자세히 보기
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>긴급 알림 카드</CardTitle>
                <CardDescription>여러 Badge와 Button 조합</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="emergency">긴급</Badge>
                  <Badge variant="operating">운영중</Badge>
                  <Badge variant="closed">마감</Badge>
                </div>
                <p className="text-body">
                  24시간 상담 가능한 긴급 지원 센터입니다.
                </p>
                <div className="flex gap-2">
                  <Button variant="emergency" size="touch">
                    긴급 상담 신청
                  </Button>
                  <Button variant="outline" size="touch">
                    위치 보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badge 컴포넌트 테스트 */}
        <section className="space-y-6">
          <h2 className="text-h2 border-b pb-2">Badge 컴포넌트</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-h3 mb-3">기본 Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-h3 mb-3">마음이음 커스텀 Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="operating">운영중</Badge>
                <Badge variant="closed">마감</Badge>
                <Badge variant="emergency">긴급</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-h3 mb-3">실제 사용 예시</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-body">강남 마음건강센터</span>
                  <Badge variant="operating">운영중</Badge>
                  <Badge variant="default">추천</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body">서초 심리상담센터</span>
                  <Badge variant="closed">마감</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body">24시 위기상담센터</span>
                  <Badge variant="emergency">긴급</Badge>
                  <Badge variant="operating">24시간</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 유틸리티 클래스 테스트 */}
        <section className="space-y-6">
          <h2 className="text-h2 border-b pb-2">유틸리티 클래스</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-h3 mb-3">그라디언트</h3>
              <div className="space-y-2">
                <div className="gradient-lavender p-4 rounded-lg text-white">
                  gradient-lavender 클래스
                </div>
                <div className="gradient-lavender-soft p-4 rounded-lg">
                  gradient-lavender-soft 클래스
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-h3 mb-3">텍스트 그라디언트</h3>
              <p className="text-h1 text-gradient">
                마음이음 MindConnect
              </p>
            </div>

            <div>
              <h3 className="text-h3 mb-3">Hover Lift 효과</h3>
              <div className="inline-block hover-lift p-4 bg-lavender-100 rounded-lg cursor-pointer">
                마우스를 올려보세요
              </div>
            </div>

            <div>
              <h3 className="text-h3 mb-3">터치 타겟</h3>
              <button className="touch-target bg-lavender-500 text-white rounded-md px-4">
                최소 44x44px 보장
              </button>
            </div>
          </div>
        </section>

        {/* 접근성 테스트 */}
        <section className="space-y-6">
          <h2 className="text-h2 border-b pb-2">접근성 (Accessibility)</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-h3 mb-3">포커스 링</h3>
              <div className="flex gap-3">
                <button className="focus-ring px-4 py-2 bg-lavender-500 text-white rounded-md">
                  Tab으로 포커스
                </button>
                <input
                  type="text"
                  placeholder="포커스 테스트"
                  className="focus-ring px-4 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <h3 className="text-h3 mb-3">터치 타겟 크기</h3>
              <p className="text-body mb-3">모든 인터랙티브 요소는 최소 44x44px (touch size)</p>
              <div className="flex gap-3">
                <Button size="touch" variant="operating">운영중 센터 찾기</Button>
                <Button size="touch" variant="emergency">긴급 상담</Button>
              </div>
            </div>
          </div>
        </section>

        {/* 반응형 테스트 안내 */}
        <section className="space-y-6">
          <h2 className="text-h2 border-b pb-2">반응형 디자인</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-body mb-4">
                브라우저 창 크기를 조절하여 반응형 디자인을 테스트하세요:
              </p>
              <ul className="list-disc list-inside space-y-2 text-small text-muted-foreground">
                <li>모바일: 375px ~ 639px</li>
                <li>태블릿 (sm): 640px ~ 767px</li>
                <li>작은 데스크톱 (md): 768px ~ 1023px</li>
                <li>데스크톱 (lg): 1024px ~ 1279px</li>
                <li>큰 데스크톱 (xl): 1280px+</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
