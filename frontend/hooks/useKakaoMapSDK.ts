/**
 * Kakao Map SDK 동적 로딩 훅
 *
 * Kakao Map JavaScript SDK를 동적으로 로드하고 로딩 상태를 관리합니다.
 *
 * @returns {UseKakaoMapSDKReturn} SDK 로딩 상태 및 에러 정보
 *
 * @example
 * const { isLoaded, isError, error } = useKakaoMapSDK();
 *
 * if (isError) return <div>지도를 불러올 수 없습니다</div>;
 * if (!isLoaded) return <MapSkeleton />;
 * return <KakaoMapView />;
 */

import { useEffect, useState } from 'react';

/**
 * Kakao Map SDK 훅 반환 타입
 */
export interface UseKakaoMapSDKReturn {
  /**
   * SDK 로딩 완료 여부
   */
  isLoaded: boolean;

  /**
   * SDK 로딩 에러 발생 여부
   */
  isError: boolean;

  /**
   * 에러 객체 (에러 발생 시)
   */
  error?: Error;
}

/**
 * Kakao Map SDK 스크립트 ID (중복 로딩 방지용)
 */
const KAKAO_MAP_SCRIPT_ID = 'kakao-map-sdk';

/**
 * Kakao Map SDK 동적 로딩 훅
 */
export function useKakaoMapSDK(): UseKakaoMapSDKReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    // 환경 변수에서 API 키 가져오기
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    if (!apiKey || apiKey === 'YOUR_KAKAO_MAP_API_KEY_HERE') {
      const apiError = new Error(
        'Kakao Map API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
      );
      setError(apiError);
      setIsError(true);
      console.error(apiError.message);
      return;
    }

    // SSR 환경 체크 (window 객체가 없으면 실행하지 않음)
    if (typeof window === 'undefined') {
      return;
    }

    // 이미 SDK가 로드되어 있는지 확인
    if (window.kakao?.maps) {
      setIsLoaded(true);
      return;
    }

    // 이미 스크립트 태그가 존재하는지 확인
    const existingScript = document.getElementById(KAKAO_MAP_SCRIPT_ID);
    if (existingScript) {
      // 스크립트가 존재하지만 아직 로드되지 않은 경우
      existingScript.addEventListener('load', handleScriptLoad);
      existingScript.addEventListener('error', handleScriptError);

      return () => {
        existingScript.removeEventListener('load', handleScriptLoad);
        existingScript.removeEventListener('error', handleScriptError);
      };
    }

    // 새로운 스크립트 태그 생성
    const script = document.createElement('script');
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.type = 'text/javascript';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;

    // 로드 성공 핸들러
    script.addEventListener('load', handleScriptLoad);

    // 로드 실패 핸들러
    script.addEventListener('error', handleScriptError);

    // DOM에 스크립트 추가
    document.head.appendChild(script);

    // 클린업 함수
    return () => {
      script.removeEventListener('load', handleScriptLoad);
      script.removeEventListener('error', handleScriptError);

      // 컴포넌트 언마운트 시 스크립트 제거
      const scriptElement = document.getElementById(KAKAO_MAP_SCRIPT_ID);
      if (scriptElement) {
        document.head.removeChild(scriptElement);
      }
    };
  }, []);

  /**
   * 스크립트 로드 성공 핸들러
   */
  const handleScriptLoad = () => {
    // kakao.maps.load() 함수로 지도 API 초기화
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        setIsLoaded(true);
        setIsError(false);
        console.log('Kakao Map SDK 로딩 완료');
      });
    } else {
      const loadError = new Error('Kakao Map SDK 객체를 찾을 수 없습니다.');
      setError(loadError);
      setIsError(true);
      console.error(loadError.message);
    }
  };

  /**
   * 스크립트 로드 실패 핸들러
   */
  const handleScriptError = () => {
    const loadError = new Error(
      'Kakao Map SDK 로딩에 실패했습니다. 네트워크 연결을 확인해주세요.'
    );
    setError(loadError);
    setIsError(true);
    console.error(loadError.message);
  };

  return {
    isLoaded,
    isError,
    error,
  };
}
