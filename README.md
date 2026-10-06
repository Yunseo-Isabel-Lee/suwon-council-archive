# 수원시의원 디지털 아카이브

『수원시의원으로 살다』 Ⅱ장 「수원시의원들의 사회적 배경」(황병주·유상희)을 바탕으로 만든 정적 디지털 아카이브 사이트입니다. 빌드 과정 없이 GitHub Pages에 바로 배포할 수 있습니다.

**사이트 주소: https://yunseo-isabel-lee.github.io/suwon-council-archive/**

## 구성

| 파일 | 내용 |
| --- | --- |
| `index.html` | 메인 (히어로 슬라이드 + 검색, 시대별 탐색, 주요 자료, 전시 안내) |
| `collection.html` | 컬렉션 (통합 검색, 시대·유형 필터, 정렬, 상세 보기) |
| `exhibition.html` | 디지털 전시 「시대를 닮은 의원들」 |
| `about.html` | 소개 (원문 정보, 메타데이터, 자료 출처, 이용 안내) |
| `assets/js/data.js` | 자료·인물 데이터. 항목을 추가하면 컬렉션·검색·메인에 자동 반영 |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | 파비콘 |

## 배포 (GitHub Pages)

이미 배포되어 있습니다. 새로 배포할 때의 절차는 다음과 같습니다.

1. 이 폴더의 내용을 저장소 루트에 올립니다 (`.nojekyll` 파일 포함).
2. 저장소 **Settings → Pages → Build and deployment**에서 Source를 `Deploy from a branch`, 브랜치를 `main` / `/(root)`로 지정합니다.
3. 잠시 후 `https://<계정>.github.io/<저장소>/`에서 확인합니다.

## 내 컴퓨터에서 미리보기 (선택)

수정한 내용을 GitHub에 올리기 전에 내 컴퓨터에서만 확인하고 싶을 때 쓰는 방법입니다. 공개 사이트 주소와는 관계없습니다.

```bash
python -m http.server 8000
```

위 명령을 이 폴더에서 실행한 뒤, 같은 컴퓨터의 브라우저에서 http://localhost:8000 을 엽니다. (`localhost`는 "내 컴퓨터"를 뜻하므로 다른 사람은 이 주소로 접속할 수 없습니다.)

## 자료 추가

`assets/js/data.js`의 `ITEMS` 배열에 같은 형식으로 객체를 추가합니다. 이미지는 `assets/img/`에 넣고 `img` 경로를 지정합니다. `featured: true`를 지정하면 메인의 주요 자료에 표시됩니다.

이미지 저작권은 각 소장처(수원박물관, 수원시의회, 중앙선거관리위원회, 차인순 유족 등)에 있습니다.
