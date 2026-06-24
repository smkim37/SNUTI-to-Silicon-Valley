window.App = window.App || {};
(function (A) {
  "use strict";
  // 방문 학교·기업 정보(큐레이션). key는 people.json items[].activity 와 정확히 일치한다.
  // yt: 공식 홍보/소개 영상의 YouTube ID(oEmbed로 임베드 검증). null이면 q로 유튜브 검색 링크를 대신 보여준다.
  A.places = {
    "Stanford": {
      name: "Stanford University", type: "school",
      intro: "실리콘밸리 심장부에 자리한 세계적 연구중심 사립대학.",
      why: "수많은 빅테크·스타트업 창업자를 배출한 혁신 생태계의 출발점을 직접 본다.",
      yt: "95N_spFNEkY", q: "Stanford University campus tour official"
    },
    "UC Berkeley": {
      name: "UC Berkeley", type: "school",
      intro: "AI·컴퓨터과학에서 세계 최정상으로 꼽히는 공립 연구대학.",
      why: "기초연구가 산업 혁신으로 이어지는 현장과 인재 양성 방식을 살핀다.",
      yt: "lkoVXamWbFQ", q: "UC Berkeley campus tour official"
    },
    "Joby Aviation": {
      name: "Joby Aviation", type: "company",
      intro: "전기 수직이착륙(eVTOL) 에어택시를 개발하는 미래 항공 모빌리티 기업.",
      why: "하늘을 나는 교통수단이 현실이 되는 딥테크 제조 현장을 본다.",
      yt: "IKzpwPbTnSU", q: "Joby Aviation eVTOL official"
    },
    "Apple": {
      name: "Apple", type: "company",
      intro: "아이폰·맥으로 세계를 바꾼 글로벌 하드웨어·소프트웨어 기업.",
      why: "하드웨어·소프트웨어·디자인을 하나로 통합하는 제품 철학을 경험한다.",
      yt: "hF8swzNR1-o", q: "Apple Park headquarters"
    },
    "Plug and Play": {
      name: "Plug and Play Tech Center", type: "company",
      intro: "스타트업과 대기업·투자자를 잇는 세계 최대 규모의 액셀러레이터.",
      why: "실리콘밸리의 오픈이노베이션과 스타트업 투자 생태계가 작동하는 방식을 배운다.",
      yt: "v6Xdz6hAuAg", q: "Plug and Play Tech Center accelerator"
    },
    "MangoBoost": {
      name: "MangoBoost", type: "company",
      intro: "AI 데이터센터용 가속 반도체(DPU)를 만드는 한국계 시스템 반도체 스타트업.",
      why: "AI 인프라의 병목을 푸는 시스템 반도체 스타트업의 도전을 듣는다.",
      yt: "RiR_wccblg8", q: "MangoBoost DPU AI infrastructure"
    },
    "NVIDIA": {
      name: "NVIDIA", type: "company",
      intro: "GPU·가속컴퓨팅 플랫폼으로 AI 시대를 이끄는 절대 강자.",
      why: "오늘날 AI 붐을 가능케 한 핵심 하드웨어·소프트웨어 생태계를 본다.",
      yt: "sxHFDKwJGGo", q: "NVIDIA company overview"
    },
    "Salesforce": {
      name: "Salesforce", type: "company",
      intro: "세계 1위 클라우드 CRM·엔터프라이즈 SaaS 기업.",
      why: "B2B 소프트웨어와 AI가 결합되는 엔터프라이즈 비즈니스를 살핀다.",
      yt: "TUXh42V_ng4", q: "Salesforce company overview"
    },
    "SK Hynix": {
      name: "SK hynix America", type: "company",
      intro: "AI 메모리(HBM)를 선도하는 글로벌 반도체 기업의 미주 거점.",
      why: "AI 시대 메모리 반도체의 전략과 현지 비즈니스를 직접 듣는다.",
      yt: "n4LnZ5W64DU", q: "SK hynix HBM AI memory"
    },
    "Bloom Energy": {
      name: "Bloom Energy", type: "company",
      intro: "연료전지 기반 분산발전으로 청정에너지를 공급하는 기업.",
      why: "AI·데이터센터 시대에 폭증하는 전력 수요와 에너지 해법을 본다.",
      yt: "wN4Z0iFifxc", q: "Bloom Energy fuel cell"
    },
    "BreezeBio": {
      name: "BreezeBio (구 GenEdit)", type: "company",
      intro: "유전자 치료제 전달 기술을 개발하는 바이오테크 스타트업.",
      why: "딥테크가 생명과학으로 확장되는 바이오 혁신 현장을 경험한다.",
      yt: null, q: "GenEdit gene therapy biotech"
    },
    "Cisco": {
      name: "Cisco", type: "company",
      intro: "전 세계 인터넷을 떠받치는 네트워크 인프라·보안 기업.",
      why: "AI 트래픽 시대에 네트워크·보안 인프라가 어떻게 진화하는지 본다.",
      yt: "fIcKUqpVCzM", q: "Cisco company overview"
    },
    "Google": {
      name: "Google", type: "company",
      intro: "검색부터 AI까지 아우르는 세계 최대 기술 기업 중 하나.",
      why: "대규모 AI 연구와 제품이 실제로 만들어지는 본거지를 경험한다.",
      yt: "61JHONRXhjs", q: "Google company about"
    },
    "Bear Robotics": {
      name: "Bear Robotics", type: "company",
      intro: "자율주행 서빙로봇을 만드는 한국계 실리콘밸리 로보틱스 스타트업.",
      why: "AI·로봇이 일상 서비스로 들어오는 피지컬 AI 현장을 본다.",
      yt: "qbji87-HyfY", q: "Bear Robotics Servi serving robot"
    },
    "Moloco": {
      name: "Moloco", type: "company",
      intro: "머신러닝 기반 광고·커머스 성장 플랫폼을 운영하는 기업.",
      why: "머신러닝이 비즈니스 성과로 직결되는 응용 AI의 사례를 배운다.",
      yt: "pe4C-M0reRM", q: "Moloco machine learning advertising"
    }
  };
})(window.App);
