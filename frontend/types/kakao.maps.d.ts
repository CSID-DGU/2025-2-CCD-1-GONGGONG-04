/**
 * Kakao Maps JavaScript SDK Type Declarations
 * API 문서: https://apis.map.kakao.com/web/documentation/
 */

declare namespace kakao {
  namespace maps {
    /**
     * 지도 클래스
     */
    class Map {
      constructor(container: HTMLElement, options: MapOptions);

      /**
       * 지도의 중심 좌표를 설정합니다
       */
      setCenter(latlng: LatLng): void;

      /**
       * 지도의 중심 좌표를 반환합니다
       */
      getCenter(): LatLng;

      /**
       * 지도의 확대/축소 레벨을 설정합니다
       */
      setLevel(level: number, options?: { animate?: boolean }): void;

      /**
       * 지도의 확대/축소 레벨을 반환합니다
       */
      getLevel(): number;

      /**
       * 지도 타입을 설정합니다
       */
      setMapTypeId(mapTypeId: MapTypeId): void;

      /**
       * 지도 영역을 다시 그립니다
       */
      relayout(): void;

      /**
       * 지도의 경계 영역을 반환합니다
       */
      getBounds(): LatLngBounds;

      /**
       * 지도의 영역을 주어진 영역으로 재설정합니다
       */
      setBounds(bounds: LatLngBounds): void;
    }

    /**
     * 지도 생성 옵션
     */
    interface MapOptions {
      /**
       * 지도의 중심 좌표
       */
      center: LatLng;

      /**
       * 지도의 확대/축소 레벨 (1-14, 작을수록 확대)
       */
      level: number;

      /**
       * 지도 타입 (기본값: ROADMAP)
       */
      mapTypeId?: MapTypeId;

      /**
       * 마우스 드래그로 지도 이동 가능 여부 (기본값: true)
       */
      draggable?: boolean;

      /**
       * 마우스 휠/모바일 터치를 이용한 확대/축소 가능 여부 (기본값: true)
       */
      scrollwheel?: boolean;

      /**
       * 더블클릭 확대 가능 여부 (기본값: true)
       */
      disableDoubleClickZoom?: boolean;

      /**
       * 지도 확대/축소 컨트롤 표시 여부 (기본값: false)
       */
      zoomControl?: boolean;
    }

    /**
     * 좌표 클래스
     */
    class LatLng {
      constructor(latitude: number, longitude: number);

      /**
       * 위도 값을 반환합니다
       */
      getLat(): number;

      /**
       * 경도 값을 반환합니다
       */
      getLng(): number;

      /**
       * 좌표가 같은지 비교합니다
       */
      equals(latlng: LatLng): boolean;

      /**
       * toString 결과값을 반환합니다
       */
      toString(): string;
    }

    /**
     * 지도 영역 클래스
     */
    class LatLngBounds {
      constructor(sw: LatLng, ne: LatLng);

      /**
       * 영역 정보를 확장합니다
       */
      extend(latlng: LatLng): void;

      /**
       * 영역의 남서쪽 좌표를 반환합니다
       */
      getSouthWest(): LatLng;

      /**
       * 영역의 북동쪽 좌표를 반환합니다
       */
      getNorthEast(): LatLng;

      /**
       * 영역이 주어진 좌표를 포함하는지 확인합니다
       */
      contain(latlng: LatLng): boolean;
    }

    /**
     * 마커 클래스
     */
    class Marker {
      constructor(options: MarkerOptions);

      /**
       * 마커를 지도에 표시합니다
       */
      setMap(map: Map | null): void;

      /**
       * 마커의 좌표를 설정합니다
       */
      setPosition(position: LatLng): void;

      /**
       * 마커의 좌표를 반환합니다
       */
      getPosition(): LatLng;

      /**
       * 마커의 클릭 가능 여부를 설정합니다
       */
      setClickable(clickable: boolean): void;

      /**
       * 마커의 z-index를 설정합니다
       */
      setZIndex(zIndex: number): void;
    }

    /**
     * 마커 생성 옵션
     */
    interface MarkerOptions {
      /**
       * 마커를 표시할 지도
       */
      map?: Map;

      /**
       * 마커의 좌표
       */
      position: LatLng;

      /**
       * 마커 이미지
       */
      image?: MarkerImage;

      /**
       * 마커의 title
       */
      title?: string;

      /**
       * 드래그 가능 여부
       */
      draggable?: boolean;

      /**
       * 클릭 가능 여부
       */
      clickable?: boolean;

      /**
       * z-index
       */
      zIndex?: number;
    }

    /**
     * 마커 이미지 클래스
     */
    class MarkerImage {
      constructor(src: string, size: Size, options?: MarkerImageOptions);
    }

    /**
     * 마커 이미지 옵션
     */
    interface MarkerImageOptions {
      /**
       * 마커 이미지의 alt 속성
       */
      alt?: string;

      /**
       * 마커의 클릭 또는 마우스오버 가능한 영역
       */
      coords?: string;

      /**
       * 이미지의 offset
       */
      offset?: Point;

      /**
       * shape
       */
      shape?: string;

      /**
       * 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
       */
      spriteOrigin?: Point;

      /**
       * 스프라이트 이미지의 전체 크기
       */
      spriteSize?: Size;
    }

    /**
     * 인포윈도우 클래스
     */
    class InfoWindow {
      constructor(options: InfoWindowOptions);

      /**
       * 인포윈도우를 지도에 표시합니다
       */
      open(map: Map, marker?: Marker): void;

      /**
       * 인포윈도우를 닫습니다
       */
      close(): void;

      /**
       * 인포윈도우의 내용을 설정합니다
       */
      setContent(content: string | HTMLElement): void;

      /**
       * 인포윈도우의 위치를 설정합니다
       */
      setPosition(position: LatLng): void;
    }

    /**
     * 인포윈도우 생성 옵션
     */
    interface InfoWindowOptions {
      /**
       * 인포윈도우를 표시할 위치
       */
      position?: LatLng;

      /**
       * 인포윈도우에 표시할 내용
       */
      content: string | HTMLElement;

      /**
       * 삭제 가능한 X 버튼 표시 여부
       */
      removable?: boolean;

      /**
       * z-index
       */
      zIndex?: number;
    }

    /**
     * 크기 클래스
     */
    class Size {
      constructor(width: number, height: number);
    }

    /**
     * 포인트 클래스
     */
    class Point {
      constructor(x: number, y: number);
    }

    /**
     * 지도 타입 ID
     */
    enum MapTypeId {
      /**
       * 일반 지도
       */
      ROADMAP = 1,

      /**
       * 스카이뷰
       */
      SKYVIEW = 2,

      /**
       * 하이브리드 (스카이뷰 + 레이블)
       */
      HYBRID = 3,
    }

    /**
     * 이벤트 관련
     */
    namespace event {
      /**
       * 이벤트 핸들러를 등록합니다
       */
      function addListener(
        target: any,
        type: string,
        handler: (evt?: any) => void
      ): void;

      /**
       * 이벤트 핸들러를 제거합니다
       */
      function removeListener(
        target: any,
        type: string,
        handler: (evt?: any) => void
      ): void;
    }

    /**
     * services 네임스페이스
     */
    namespace services {
      /**
       * 장소 검색 클래스
       */
      class Places {
        constructor();

        /**
         * 키워드로 장소를 검색합니다
         */
        keywordSearch(
          keyword: string,
          callback: (result: any[], status: Status) => void,
          options?: SearchOptions
        ): void;

        /**
         * 카테고리로 장소를 검색합니다
         */
        categorySearch(
          category: string,
          callback: (result: any[], status: Status) => void,
          options?: SearchOptions
        ): void;
      }

      /**
       * 검색 옵션
       */
      interface SearchOptions {
        /**
         * 검색 영역
         */
        bounds?: LatLngBounds;

        /**
         * 중심 좌표
         */
        location?: LatLng;

        /**
         * 중심 좌표로부터의 반경 (m)
         */
        radius?: number;

        /**
         * 결과 페이지 번호
         */
        page?: number;

        /**
         * 한 페이지당 결과 개수 (기본값: 15, 최대 15)
         */
        size?: number;
      }

      /**
       * 검색 결과 상태
       */
      enum Status {
        OK = 'OK',
        ZERO_RESULT = 'ZERO_RESULT',
        ERROR = 'ERROR',
      }
    }
  }
}

/**
 * Window 객체 확장
 */
interface Window {
  kakao: typeof kakao;
}
