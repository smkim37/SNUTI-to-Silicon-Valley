window.App = window.App || {};
(function (A) {
  "use strict";
  // 방문 학교·기업 정보(큐레이션). key는 people.json items[].activity 와 정확히 일치한다.
  // yt: 공식 홍보/소개 영상의 YouTube ID(oEmbed로 임베드 검증). null이면 q로 유튜브 검색 링크를 대신 보여준다.
  A.places = {
    "Stanford": {
      name: "Stanford University", type: "school",
      intro: "실리콘밸리 심장부에 자리한 세계적 연구중심 사립대학이다. 컴퓨터과학·AI 분야에서 최정상으로 꼽히며 구글·HP·인스타그램 등 수많은 빅테크와 스타트업이 이곳에서 태어났다. 산학협력과 창업이 자연스럽게 이어지는 혁신 생태계의 출발점으로 평가받는다.",
      yt: "95N_spFNEkY", q: "Stanford University campus tour official"
    },
    "UC Berkeley": {
      name: "UC Berkeley", type: "school",
      intro: "1868년 설립된 UC 시스템의 첫 캠퍼스이자 세계 최정상 공립 연구대학이다. AI·컴퓨터과학(EECS) 분야에서 독보적 연구 성과를 내며 기초연구의 산실로 꼽힌다. 졸업생과 연구가 실리콘밸리의 산업 혁신으로 곧장 이어지는 것으로 유명하다.",
      yt: "lkoVXamWbFQ", q: "UC Berkeley campus tour official"
    },
    "Joby Aviation": {
      name: "Joby Aviation", type: "company",
      intro: "전기 수직이착륙(eVTOL) 항공기를 개발하는 미래 항공 모빌리티 기업이다. 조종사 1명과 승객 4명을 태우고 도심을 조용히 비행하는 '에어택시' 상용화를 추진한다. 도심항공교통(UAM)의 대표 주자로, 항공기 인증과 양산을 동시에 준비하고 있다.",
      yt: "IKzpwPbTnSU", q: "Joby Aviation eVTOL official"
    },
    "Apple": {
      name: "Apple", type: "company",
      intro: "아이폰·맥·애플워치로 세계를 바꾼 글로벌 하드웨어·소프트웨어 기업이다. 자체 설계 칩(Apple Silicon)과 운영체제, 서비스를 수직 통합해 제품 경험을 완성한다. 최근에는 온디바이스 AI(Apple Intelligence)로 프라이버시 중심의 인공지능을 선보이고 있다.",
      yt: "hF8swzNR1-o", q: "Apple Park headquarters"
    },
    "Plug and Play": {
      name: "Plug and Play Tech Center", type: "company",
      intro: "스타트업과 대기업·투자자를 연결하는 세계 최대 규모의 액셀러레이터다. 페이팔·드롭박스 등 유명 스타트업을 초기에 발굴·투자한 이력으로 잘 알려져 있다. 실리콘밸리식 오픈 이노베이션 모델을 전 세계로 확장해 운영한다.",
      yt: "v6Xdz6hAuAg", q: "Plug and Play Tech Center accelerator"
    },
    "MangoBoost": {
      name: "MangoBoost", type: "company",
      intro: "AI 데이터센터의 성능과 효율을 높이는 데이터처리장치(DPU)를 만드는 시스템 반도체 스타트업이다. 한국계 창업자가 설립해 실리콘밸리에서 글로벌 시장을 공략한다. AI 인프라의 데이터 병목을 풀어 GPU 활용도를 끌어올리는 기술에 집중한다.",
      yt: "RiR_wccblg8", q: "MangoBoost DPU AI infrastructure"
    },
    "NVIDIA": {
      name: "NVIDIA", type: "company",
      intro: "GPU를 발명하고 AI·가속컴퓨팅 플랫폼을 이끄는 세계적 반도체 기업이다. CUDA 생태계와 데이터센터 GPU로 오늘날 생성형 AI 붐의 토대를 만들었다. 칩부터 소프트웨어·시스템까지 아우르는 풀스택 전략으로 시장을 주도한다.",
      yt: "sxHFDKwJGGo", q: "NVIDIA company overview"
    },
    "Salesforce": {
      name: "Salesforce", type: "company",
      intro: "세계 1위 클라우드 기반 고객관계관리(CRM) 소프트웨어 기업이다. 영업·마케팅·서비스를 잇는 엔터프라이즈 SaaS 플랫폼을 제공한다. 최근에는 생성형·에이전트 AI를 접목한 'Agentforce'로 기업용 AI를 확장하고 있다.",
      yt: "TUXh42V_ng4", q: "Salesforce company overview"
    },
    "SK Hynix": {
      name: "SK hynix America", type: "company",
      intro: "AI 메모리(HBM)를 선도하는 글로벌 반도체 기업 SK하이닉스의 미주 거점이다. DRAM·낸드플래시 등 메모리 반도체의 현지 영업과 연구개발을 담당한다. AI 가속기에 필수인 고대역폭 메모리 시장에서 핵심 공급자로 자리한다.",
      yt: "n4LnZ5W64DU", q: "SK hynix HBM AI memory"
    },
    "Bloom Energy": {
      name: "Bloom Energy", type: "company",
      intro: "연소 없이 연료를 전기로 바꾸는 고체산화물 연료전지(SOFC) 기업이다. 천연가스·바이오가스·수소를 쓰는 분산형 '에너지 서버'를 제조한다. AI 데이터센터의 폭증하는 전력 수요에 대응하는 청정·온사이트 발전 솔루션으로 주목받는다.",
      yt: "wN4Z0iFifxc", q: "Bloom Energy fuel cell"
    },
    "BreezeBio": {
      name: "BreezeBio (구 GenEdit)", type: "company",
      intro: "비바이러스성 나노입자 전달 기술로 정밀 유전자치료제를 개발하는 바이오테크 스타트업이다(구 GenEdit). 유전자치료의 최대 난제인 '체내 전달' 문제를 독자 고분자 기술로 푼다. 딥테크가 생명과학으로 확장되는 대표적 사례로 꼽힌다.",
      yt: null, q: "GenEdit gene therapy biotech"
    },
    "Cisco": {
      name: "Cisco", type: "company",
      intro: "전 세계 인터넷을 떠받치는 네트워크 장비·보안·소프트웨어 기업이다. 라우터·스위치부터 클라우드 보안까지 기업 IT 인프라 전반을 아우른다. AI 트래픽이 급증하는 시대에 네트워크와 보안의 진화를 이끌고 있다.",
      yt: "fIcKUqpVCzM", q: "Cisco company overview"
    },
    "Google": {
      name: "Google", type: "company",
      intro: "검색·광고·안드로이드·클라우드를 아우르는 세계 최대 기술 기업 중 하나다. 트랜스포머 등 핵심 AI 연구를 탄생시킨 곳으로, 현재 Gemini로 생성형 AI를 이끈다. 대규모 연구가 곧바로 전 세계 제품으로 이어지는 것이 강점이다.",
      yt: "61JHONRXhjs", q: "Google company about"
    },
    "Bear Robotics": {
      name: "Bear Robotics", type: "company",
      intro: "식당·호텔용 자율주행 서빙로봇 '서비(Servi)'를 만드는 실리콘밸리 로보틱스 기업이다. 구글 출신 한국계 창업자가 설립했다. AI·자율주행 기술을 실제 서비스 현장에 상용화한 '피지컬 AI'의 대표 사례다.",
      yt: "qbji87-HyfY", q: "Bear Robotics Servi serving robot"
    },
    "Moloco": {
      name: "Moloco", type: "company",
      intro: "머신러닝 기반 광고·커머스 성장 플랫폼을 운영하는 실리콘밸리 기업이다. 2013년 구글 출신 한국계 창업자가 설립해 유니콘으로 성장했다. 기업의 1차 데이터를 활용한 성과형 광고로 머신러닝의 비즈니스 적용을 보여준다.",
      yt: "pe4C-M0reRM", q: "Moloco machine learning advertising"
    }
  };
})(window.App);
