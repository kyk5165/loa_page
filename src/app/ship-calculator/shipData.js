// 재화 종류 정의
export const CURRENCY_TYPES = {
  adventureSeal: '모험의 인장',
  pirateCoin: '해적 주화',
  oceanCoin: '대양의 주화'
};

// 자원 등급 정의
export const RESOURCE_GRADES = {
  COMMON: 'common',
  ADVANCED: 'advanced',
  RARE: 'rare',
  HEROIC: 'heroic',
  LEGENDARY: 'legendary'
};

export const GRADE_NAMES = {
  common: '일반',
  advanced: '고급',
  rare: '희귀',
  heroic: '영웅',
  legendary: '전설'
};

export const GRADE_COLORS = {
  common: 'text-gray-600',
  advanced: 'text-green-600',
  rare: 'text-blue-600',
  heroic: 'text-purple-600',
  legendary: 'text-orange-600'
};

export const GRADE_BG_COLORS = {
  common: 'bg-gray-50 border-gray-200',
  advanced: 'bg-green-50 border-green-200',
  rare: 'bg-blue-50 border-blue-200',
  heroic: 'bg-purple-50 border-purple-200',
  legendary: 'bg-orange-50 border-orange-200'
};

// 공통 자원 정의 (등급 및 교환 가격 포함)
export const COMMON_RESOURCES = {
  basicPart: { 
    name: '일반 선박 부품', 
    grade: RESOURCE_GRADES.COMMON,
    prices: {
      adventureSeal: 0, // 구매 불가
      pirateCoin: 0,
      oceanCoin: 0
    }
  },
  advancedPart: { 
    name: '고급 선박 부품', 
    grade: RESOURCE_GRADES.ADVANCED,
    prices: {
      adventureSeal: 0, // 구매 불가
      pirateCoin: 0,
      oceanCoin: 0
    }
  },
  rarePart: { 
    name: '희귀 선박 부품', 
    grade: RESOURCE_GRADES.RARE,
    prices: {
      adventureSeal: 0, // 구매 불가
      pirateCoin: 0,
      oceanCoin: 0
    }
  },
  basicWood: { 
    name: '일반 목재', 
    grade: RESOURCE_GRADES.ADVANCED,
    prices: {
      adventureSeal: 40,
      pirateCoin: 250,
      oceanCoin: 0
    }
  },
  steelPlate: { 
    name: '강철판', 
    grade: RESOURCE_GRADES.HEROIC,
    prices: {
      adventureSeal: 80,
      pirateCoin: 500,
      oceanCoin: 0
    }
  },
  specialSteelPlate: { 
    name: '특제 강철판', 
    grade: RESOURCE_GRADES.LEGENDARY,
    prices: {
      adventureSeal: 100,
      pirateCoin: 625,
      oceanCoin: 0
    }
  },
  seaEssence: { 
    name: '바다의 정수', 
    grade: RESOURCE_GRADES.LEGENDARY,
    prices: {
      adventureSeal: 120,
      pirateCoin: 750,
      oceanCoin: 0
    }
  }
};

// 선박별 전용 자원 정의 (등급 및 교환 가격 포함)
export const SHIP_SPECIFIC_RESOURCES = {
  '에스토크': {
    estokBlueprint: { 
      name: '에스토크 설계도', 
      grade: RESOURCE_GRADES.ADVANCED,
      prices: { adventureSeal: 40, pirateCoin: 0, oceanCoin: 0 }
    },
    bilbulinWood: { 
      name: '빌브린 목재', 
      grade: RESOURCE_GRADES.RARE,
      prices: { adventureSeal: 50, pirateCoin: 0, oceanCoin: 25 }
    },
    grayHammerIron: { 
      name: '회색망치 철괴', 
      grade: RESOURCE_GRADES.HEROIC,
      prices: { adventureSeal: 60, pirateCoin: 0, oceanCoin: 25 }
    },
    maneWaveCloth: { 
      name: '갈기파도 범포', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 70, pirateCoin: 0, oceanCoin: 25 }
    },
    eagleWheelFragment: { 
      name: '독수리 타륜 파편', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 80, pirateCoin: 0, oceanCoin: 25 }
    }
  },
  '풍백': {
    pongbaekBlueprint: { 
      name: '풍백 설계도', 
      grade: RESOURCE_GRADES.ADVANCED,
      prices: { adventureSeal: 40, pirateCoin: 0, oceanCoin: 0 }
    },
    soundForestBamboo: { 
      name: '소리의 숲 대나무', 
      grade: RESOURCE_GRADES.RARE,
      prices: { adventureSeal: 50, pirateCoin: 0, oceanCoin: 25 }
    },
    delphiStringDye: { 
      name: '델파이 현 염료', 
      grade: RESOURCE_GRADES.HEROIC,
      prices: { adventureSeal: 60, pirateCoin: 0, oceanCoin: 25 }
    },
    changcheonSilkCloth: { 
      name: '창천 비단 범포', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 70, pirateCoin: 0, oceanCoin: 25 }
    },
    pongyunAmulet: { 
      name: '풍운의 부적', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 80, pirateCoin: 0, oceanCoin: 25 }
    }
  },
  '바크스툼': {
    bakhstumBlueprint: { 
      name: '바크스툼 설계도', 
      grade: RESOURCE_GRADES.ADVANCED,
      prices: { adventureSeal: 40, pirateCoin: 0, oceanCoin: 0 }
    },
    sternReinforcedWood: { 
      name: '슈테른 강화 목재', 
      grade: RESOURCE_GRADES.RARE,
      prices: { adventureSeal: 50, pirateCoin: 0, oceanCoin: 25 }
    },
    reinforcedGlass: { 
      name: '강화 유리', 
      grade: RESOURCE_GRADES.HEROIC,
      prices: { adventureSeal: 60, pirateCoin: 0, oceanCoin: 25 }
    },
    manastoneEngine: { 
      name: '마나석 엔진 부품', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 70, pirateCoin: 0, oceanCoin: 25 }
    },
    glacierCrusher: { 
      name: '빙하 파쇄기 부품', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 80, pirateCoin: 0, oceanCoin: 25 }
    }
  },
  '프뉴마': {
    pnyumaBlueprint: { 
      name: '프뉴마 설계도', 
      grade: RESOURCE_GRADES.ADVANCED,
      prices: { adventureSeal: 40, pirateCoin: 0, oceanCoin: 0 }
    },
    lightWood: { 
      name: '경량 목재', 
      grade: RESOURCE_GRADES.RARE,
      prices: { adventureSeal: 50, pirateCoin: 0, oceanCoin: 25 }
    },
    premiumLubricant: { 
      name: '고급 윤활유', 
      grade: RESOURCE_GRADES.HEROIC,
      prices: { adventureSeal: 60, pirateCoin: 0, oceanCoin: 25 }
    },
    limraykeMountainOar: { 
      name: '림레이크산 노', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 70, pirateCoin: 0, oceanCoin: 25 }
    },
    premiumCloth: { 
      name: '최고급 범포', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 80, pirateCoin: 0, oceanCoin: 25 }
    }
  },
  '브람스': {
    bramsBlueprint: { 
      name: '브람스 설계도', 
      grade: RESOURCE_GRADES.ADVANCED,
      prices: { adventureSeal: 40, pirateCoin: 0, oceanCoin: 0 }
    },
    parnaWood: { 
      name: '파르나 목재', 
      grade: RESOURCE_GRADES.RARE,
      prices: { adventureSeal: 50, pirateCoin: 0, oceanCoin: 25 }
    },
    pesnarlLime: { 
      name: '페스나르 석회', 
      grade: RESOURCE_GRADES.HEROIC,
      prices: { adventureSeal: 60, pirateCoin: 0, oceanCoin: 25 }
    },
    magicAcademyDye: { 
      name: '마법학회 특제 염료', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 70, pirateCoin: 0, oceanCoin: 25 }
    },
    bellionGiantCloth: { 
      name: '벨리온 거대 범포', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 80, pirateCoin: 0, oceanCoin: 25 }
    }
  },
  '트라곤': {
    tragonBlueprint: { 
      name: '트라곤 설계도', 
      grade: RESOURCE_GRADES.ADVANCED,
      prices: { adventureSeal: 40, pirateCoin: 0, oceanCoin: 0 }
    },
    boldaikWood: { 
      name: '볼다이크 목재', 
      grade: RESOURCE_GRADES.RARE,
      prices: { adventureSeal: 50, pirateCoin: 0, oceanCoin: 25 }
    },
    arrogantSteel: { 
      name: '오만의 강철', 
      grade: RESOURCE_GRADES.HEROIC,
      prices: { adventureSeal: 60, pirateCoin: 0, oceanCoin: 25 }
    },
    highOutputEngine: { 
      name: '고출력 엔진 부품', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 70, pirateCoin: 0, oceanCoin: 25 }
    },
    reinforcedArmor: { 
      name: '강화 외부 장갑', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 80, pirateCoin: 0, oceanCoin: 25 }
    }
  },
  '아스트레이': {
    astrayBlueprint: { 
      name: '아스트레이 설계도', 
      grade: RESOURCE_GRADES.ADVANCED,
      prices: { adventureSeal: 40, pirateCoin: 0, oceanCoin: 0 }
    },
    pirateKnotRope: { 
      name: '해적 매듭 로프', 
      grade: RESOURCE_GRADES.RARE,
      prices: { adventureSeal: 50, pirateCoin: 0, oceanCoin: 25 }
    },
    lightningWood: { 
      name: '벼락맞은 목재', 
      grade: RESOURCE_GRADES.HEROIC,
      prices: { adventureSeal: 60, pirateCoin: 0, oceanCoin: 25 }
    },
    fightingSpiritWheel: { 
      name: '투지의 타륜 조각', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 70, pirateCoin: 0, oceanCoin: 25 }
    },
    freedomPendant: { 
      name: '자유의 펜던트', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 80, pirateCoin: 0, oceanCoin: 25 }
    }
  },
  '에이번의 상처': {
    ebonBlueprint: { 
      name: '에이번 설계도', 
      grade: RESOURCE_GRADES.ADVANCED,
      prices: { adventureSeal: 40, pirateCoin: 0, oceanCoin: 0 }
    },
    bloodWood: { 
      name: '피 묻은 목재', 
      grade: RESOURCE_GRADES.RARE,
      prices: { adventureSeal: 50, pirateCoin: 0, oceanCoin: 25 }
    },
    deadCloth: { 
      name: '망자의 범포', 
      grade: RESOURCE_GRADES.HEROIC,
      prices: { adventureSeal: 60, pirateCoin: 0, oceanCoin: 25 }
    },
    cursedOar: { 
      name: '저주받은 노', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 70, pirateCoin: 0, oceanCoin: 25 }
    },
    ebonGold: { 
      name: '에이번 금화', 
      grade: RESOURCE_GRADES.LEGENDARY,
      prices: { adventureSeal: 80, pirateCoin: 0, oceanCoin: 25 }
    }
  }
};

// 선박 데이터 (실제 로스트아크 게임 데이터 기반)
export const SHIP_DATA = {
  '에스토크': {
    name: '에스토크',
    maxLevel: 11,
    upgrades: {
      2: { basicPart: 25, advancedPart: 7, basicWood: 30 },
      3: { basicPart: 25, advancedPart: 7, basicWood: 30, estokBlueprint: 10 },
      4: { basicPart: 46, advancedPart: 13, basicWood: 50, estokBlueprint: 20 },
      5: { basicPart: 70, advancedPart: 20, basicWood: 70, estokBlueprint: 30 },
      6: { basicPart: 102, advancedPart: 29, basicWood: 90, bilbulinWood: 50 },
      7: { basicPart: 137, advancedPart: 41, basicWood: 100, bilbulinWood: 62 },
      8: { basicPart: 172, rarePart: 25, steelPlate: 110, grayHammerIron: 74 },
      9: { basicPart: 214, rarePart: 31, steelPlate: 120, grayHammerIron: 96 },
      10: { basicPart: 263, rarePart: 38, specialSteelPlate: 130, maneWaveCloth: 128 },
      11: { basicPart: 329, rarePart: 48, seaEssence: 163, eagleWheelFragment: 161 }
    }
  },
  '풍백': {
    name: '풍백',
    maxLevel: 11,
    upgrades: {
      2: { basicPart: 25, advancedPart: 7, basicWood: 30 },
      3: { basicPart: 25, advancedPart: 7, basicWood: 30, pongbaekBlueprint: 10 },
      4: { basicPart: 46, advancedPart: 13, basicWood: 50, pongbaekBlueprint: 20 },
      5: { basicPart: 70, advancedPart: 20, basicWood: 70, pongbaekBlueprint: 30 },
      6: { basicPart: 102, advancedPart: 29, basicWood: 90, soundForestBamboo: 50 },
      7: { basicPart: 137, advancedPart: 41, basicWood: 100, soundForestBamboo: 62 },
      8: { basicPart: 172, rarePart: 25, steelPlate: 110, delphiStringDye: 74 },
      9: { basicPart: 214, rarePart: 31, steelPlate: 120, delphiStringDye: 96 },
      10: { basicPart: 263, rarePart: 38, specialSteelPlate: 130, changcheonSilkCloth: 128 },
      11: { basicPart: 329, rarePart: 48, seaEssence: 163, pongyunAmulet: 161 }
    }
  },
  '바크스툼': {
    name: '바크스툼',
    maxLevel: 11,
    upgrades: {
      2: { basicPart: 25, advancedPart: 7, basicWood: 30 },
      3: { basicPart: 25, advancedPart: 7, basicWood: 30, bakhstumBlueprint: 10 },
      4: { basicPart: 46, advancedPart: 13, basicWood: 50, bakhstumBlueprint: 20 },
      5: { basicPart: 70, advancedPart: 20, basicWood: 70, bakhstumBlueprint: 30 },
      6: { basicPart: 102, advancedPart: 29, basicWood: 90, sternReinforcedWood: 50 },
      7: { basicPart: 137, advancedPart: 41, basicWood: 100, sternReinforcedWood: 62 },
      8: { basicPart: 172, rarePart: 25, steelPlate: 110, reinforcedGlass: 74 },
      9: { basicPart: 214, rarePart: 31, steelPlate: 120, reinforcedGlass: 96 },
      10: { basicPart: 263, rarePart: 38, specialSteelPlate: 130, manastoneEngine: 128 },
      11: { basicPart: 329, rarePart: 48, seaEssence: 163, glacierCrusher: 161 }
    }
  },
  '프뉴마': {
    name: '프뉴마',
    maxLevel: 11,
    upgrades: {
      2: { basicPart: 25, advancedPart: 7, basicWood: 30 },
      3: { basicPart: 25, advancedPart: 7, basicWood: 30, pnyumaBlueprint: 10 },
      4: { basicPart: 46, advancedPart: 13, basicWood: 50, pnyumaBlueprint: 20 },
      5: { basicPart: 70, advancedPart: 20, basicWood: 70, pnyumaBlueprint: 30 },
      6: { basicPart: 102, advancedPart: 29, basicWood: 90, lightWood: 50 },
      7: { basicPart: 137, advancedPart: 41, basicWood: 100, lightWood: 62 },
      8: { basicPart: 172, rarePart: 25, steelPlate: 110, premiumLubricant: 74 },
      9: { basicPart: 214, rarePart: 31, steelPlate: 120, premiumLubricant: 96 },
      10: { basicPart: 263, rarePart: 38, specialSteelPlate: 130, limraykeMountainOar: 128 },
      11: { basicPart: 329, rarePart: 48, seaEssence: 163, premiumCloth: 161 }
    }
  },
  '브람스': {
    name: '브람스',
    maxLevel: 11,
    upgrades: {
      2: { basicPart: 25, advancedPart: 7, basicWood: 30 },
      3: { basicPart: 25, advancedPart: 7, basicWood: 30, bramsBlueprint: 10 },
      4: { basicPart: 46, advancedPart: 13, basicWood: 50, bramsBlueprint: 20 },
      5: { basicPart: 70, advancedPart: 20, basicWood: 70, bramsBlueprint: 30 },
      6: { basicPart: 102, advancedPart: 29, basicWood: 90, parnaWood: 50 },
      7: { basicPart: 137, advancedPart: 41, basicWood: 100, parnaWood: 62 },
      8: { basicPart: 172, rarePart: 25, steelPlate: 110, pesnarlLime: 74 },
      9: { basicPart: 214, rarePart: 31, steelPlate: 120, pesnarlLime: 96 },
      10: { basicPart: 263, rarePart: 38, specialSteelPlate: 130, magicAcademyDye: 128 },
      11: { basicPart: 329, rarePart: 48, seaEssence: 163, bellionGiantCloth: 161 }
    }
  },
  '트라곤': {
    name: '트라곤',
    maxLevel: 11,
    upgrades: {
      2: { basicPart: 25, advancedPart: 7, basicWood: 30 },
      3: { basicPart: 25, advancedPart: 7, basicWood: 30, tragonBlueprint: 10 },
      4: { basicPart: 46, advancedPart: 13, basicWood: 50, tragonBlueprint: 20 },
      5: { basicPart: 70, advancedPart: 20, basicWood: 70, tragonBlueprint: 30 },
      6: { basicPart: 102, advancedPart: 29, basicWood: 90, boldaikWood: 50 },
      7: { basicPart: 137, advancedPart: 41, basicWood: 100, boldaikWood: 62 },
      8: { basicPart: 172, rarePart: 25, steelPlate: 110, arrogantSteel: 74 },
      9: { basicPart: 214, rarePart: 31, steelPlate: 120, arrogantSteel: 96 },
      10: { basicPart: 263, rarePart: 38, specialSteelPlate: 130, highOutputEngine: 128 },
      11: { basicPart: 329, rarePart: 48, seaEssence: 163, reinforcedArmor: 161 }
    }
  },
  '아스트레이': {
    name: '아스트레이',
    maxLevel: 11,
    upgrades: {
      2: { basicPart: 25, advancedPart: 7, basicWood: 30 },
      3: { basicPart: 25, advancedPart: 7, basicWood: 30, astrayBlueprint: 10 },
      4: { basicPart: 46, advancedPart: 13, basicWood: 50, astrayBlueprint: 20 },
      5: { basicPart: 70, advancedPart: 20, basicWood: 70, astrayBlueprint: 30 },
      6: { basicPart: 102, advancedPart: 29, basicWood: 90, pirateKnotRope: 50 },
      7: { basicPart: 137, advancedPart: 41, basicWood: 100, pirateKnotRope: 62 },
      8: { basicPart: 172, rarePart: 25, steelPlate: 110, lightningWood: 74 },
      9: { basicPart: 214, rarePart: 31, steelPlate: 120, lightningWood: 96 },
      10: { basicPart: 263, rarePart: 38, specialSteelPlate: 130, fightingSpiritWheel: 128 },
      11: { basicPart: 329, rarePart: 48, seaEssence: 163, freedomPendant: 161 }
    }
  },
  '에이번의 상처': {
    name: '에이번의 상처',
    maxLevel: 11,
    upgrades: {
      2: { basicPart: 25, advancedPart: 7, basicWood: 30 },
      3: { basicPart: 25, advancedPart: 7, basicWood: 30, ebonBlueprint: 10 },
      4: { basicPart: 46, advancedPart: 13, basicWood: 50, ebonBlueprint: 20 },
      5: { basicPart: 70, advancedPart: 20, basicWood: 70, ebonBlueprint: 30 },
      6: { basicPart: 102, advancedPart: 29, basicWood: 90, bloodWood: 50 },
      7: { basicPart: 137, advancedPart: 41, basicWood: 100, bloodWood: 62 },
      8: { basicPart: 172, rarePart: 25, steelPlate: 110, deadCloth: 74 },
      9: { basicPart: 214, rarePart: 31, steelPlate: 120, deadCloth: 96 },
      10: { basicPart: 263, rarePart: 38, specialSteelPlate: 130, cursedOar: 128 },
      11: { basicPart: 329, rarePart: 48, seaEssence: 163, ebonGold: 161 }
    }
  }
};

// 유틸리티 함수들
export const getAllResourceNames = () => {
  const allResources = {};
  // 공통 자원
  Object.entries(COMMON_RESOURCES).forEach(([key, data]) => {
    allResources[key] = data.name;
  });
  // 선박별 전용 자원
  Object.values(SHIP_SPECIFIC_RESOURCES).forEach(shipResources => {
    Object.entries(shipResources).forEach(([key, data]) => {
      allResources[key] = data.name;
    });
  });
  return allResources;
};

export const getShipSpecificResources = (shipName) => {
  return SHIP_SPECIFIC_RESOURCES[shipName] || {};
};

export const getCommonResources = () => {
  return COMMON_RESOURCES;
};

// 자원을 등급별로 그룹화
export const groupResourcesByGrade = (resources) => {
  const grouped = {
    common: [],
    advanced: [],
    rare: [],
    heroic: [],
    legendary: []
  };
  
  Object.entries(resources).forEach(([key, data]) => {
    const grade = data.grade || RESOURCE_GRADES.COMMON;
    grouped[grade].push({ key, ...data });
  });
  
  return grouped;
};
