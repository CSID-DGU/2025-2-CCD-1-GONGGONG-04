# 마음이음 (MindConnect)

정신건강증진센터 통합 검색 및 추천 플랫폼

![GitHub last commit](https://img.shields.io/github/last-commit/username/mindconnect)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-18+-green.svg)

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)

## 🎯 프로젝트 개요

### 비전
**"모든 시민이 쉽고 빠르게 필요한 정신건강 서비스를 찾고 연결될 수 있는 통합 플랫폼"**

### 미션
- 분산된 정신건강증진센터 정보를 하나의 플랫폼으로 통합
- 개인 맞춤형 센터 추천으로 적절한 서비스 매칭
- 정신건강 서비스에 대한 진입장벽 낮추기

### 해결하는 문제
- 🔍 흩어진 센터 정보로 인한 검색 어려움
- 🎯 개인 상황에 맞는 적절한 센터 선택의 어려움
- 🚪 정신건강 서비스에 대한 심리적 진입장벽

## ✨ 주요 기능

### 🗺️ 지도 기반 센터 검색
- 현재 위치 기반 주변 센터 표시
- 반경 설정 및 지역별 필터링
- 센터별 상세 정보 팝업

### 🎯 개인 맞춤 추천 시스템
- 규칙 기반 필터링 (위치, 운영시간, 센터구분)
- 사용자 선호도 설정에 따른 매칭
- 우선순위 기반 센터 정렬

### 📊 통합 정보 제공
- 센터별 운영시간, 업무내용, 전문분야
- 이용 후기 및 평점 시스템
- 센터 연락처 및 위치 정보

### ⭐ 센터 관리
- 자주 찾는 센터 즐겨찾기
- 빠른 접근을 위한 즐겨찾기 목록
- 최근 본 센터 기록

### 📚 정신건강 정보
- 기본적인 정신건강 정보 제공
- 자가진단 체크리스트
- 응급 상황 대처 가이드

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: shadcn/ui
- **상태관리**: Zustand (전역 상태), TanStack Query (서버 상태)
- **스타일링**: Tailwind CSS
- **지도 API**: 네이버 지도 API / 카카오 지도 API
- **폼 관리**: React Hook Form + Zod

### Backend
- **Framework**: Express.js
- **Database**: MySQL (센터 정보), Redis (캐싱)
- **ORM**: Prisma
- **API**: RESTful API
- **인증**: JWT 토큰 기반

### Infrastructure
- **Hosting**: Vercel (Frontend), AWS EC2 (Backend)
- **Database**: AWS RDS (MySQL)
- **CDN**: Vercel Edge Network
- **모니터링**: Google Analytics, Sentry
- **CI/CD**: GitHub Actions
