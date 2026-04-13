# Round 출시 QA 체크리스트

## 토스 미니앱 환경

- [ ] 토스 앱에서 미니앱 진입 가능
- [ ] 질문 카드가 정상 표시됨
- [ ] A/B 선택 시 같은 카드 안에서 결과로 확장됨
- [ ] 결과 바 / 퍼센트 / near-miss 메시지 정상
- [ ] 다른 사람 이유 목록 표시 정상
- [ ] 이유 입력 후 등록 정상
- [ ] 답글 바텀시트 열림 / 필터 전환 정상
- [ ] 질문 공유 버튼 정상 동작
- [ ] skip / 위로 스와이프 / 휠로 다음 질문 이동 정상
- [ ] 첫 방문 시 슬라이드 안내 코치마크 1회 표시
- [ ] DNA 페이지 진입 및 표시 정상
- [ ] locale path (`/`, `/en-us`, `/en-ph`) 진입 시 언어/질문 풀 안 섞임
- [ ] 외부 링크 없이 앱 내부에서 About / Terms / Privacy 진입 가능
- [ ] 토스 로그인 후 닉네임 미설정 시 onboarding 이동 정상
- [ ] 닉네임 저장 후 원래 피드로 복귀 정상

## 공개 페이지

- [ ] /about 정상 열림
- [ ] /privacy 정상 열림
- [ ] /terms 정상 열림
- [ ] bare URL / locale path 모두 정상 열림
- [ ] 문의 이메일 표시 정상
- [ ] 날짜/문구 오탈자 없음

## Supabase 데이터 확인

- [ ] votes 테이블에 투표 저장됨
- [ ] reasons 테이블에 이유 저장됨
- [ ] reason_replies 테이블에 답글 저장됨
- [ ] events 테이블에 이벤트 저장됨
- [ ] question_skipped 이벤트 저장됨
- [ ] question_feedback 이벤트 저장됨
- [ ] reason_engaged / reason_impression 이벤트 저장됨
- [ ] session_end 이벤트 발생 확인

## Question OS / 운영 확인

- [ ] question_metrics_snapshot 업데이트 정상
- [ ] skip_rate / feedback_rate / reason_engagement_rate / quality_score 저장 확인
- [ ] inspect API에서 status / quality 노출 확인
- [ ] cron update-metrics 수동 실행 정상
