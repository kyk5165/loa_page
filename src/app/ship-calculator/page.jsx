'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, Ship, ArrowUp, Package, AlertCircle, ArrowLeft, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { 
  SHIP_DATA, 
  COMMON_RESOURCES, 
  SHIP_SPECIFIC_RESOURCES,
  GRADE_COLORS,
  CURRENCY_TYPES
} from './shipData';

export default function ShipCalculator() {
  // 선박 선택 상태 (체크박스) - 로컬스토리지 연동
  const [selectedShips, setSelectedShips] = useState(() => {
    try {
      const saved = localStorage.getItem('ship_calculator_selected_ships');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('로컬스토리지에서 선박 선택 데이터 로드 실패:', error);
    }
    
    return {
      '에스토크': false,
      '풍백': true,
      '바크스툼': false,
      '프뉴마': false,
      '브람스': false,
      '트라곤': false,
      '아스트레이': false,
      '에이번의 상처': false
    };
  });

  // 각 선박별 현재 레벨 - 로컬스토리지 연동
  const [currentLevels, setCurrentLevels] = useState(() => {
    try {
      const saved = localStorage.getItem('ship_calculator_current_levels');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('로컬스토리지에서 레벨 데이터 로드 실패:', error);
    }
    
    const levels = {};
    Object.keys(SHIP_DATA).forEach(shipName => {
      levels[shipName] = 1;
    });
    return levels;
  });

  // 공통 목표 레벨
  const [targetLevel, setTargetLevel] = useState(11);

  // 필요자원 섹션 접기/펼치기 상태
  const [isRequiredResourcesExpanded, setIsRequiredResourcesExpanded] = useState(false);

  // 전체 재화 선택 (null이면 선택 안함, 'custom'이면 사용자 지정)
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // 자원별 개별 재화 선택
  const [individualCurrencies, setIndividualCurrencies] = useState({});

  // 공통 자원 상태 관리 (로컬스토리지 연동)
  const [ownedCommonResources, setOwnedCommonResources] = useState(() => {
    try {
      const saved = localStorage.getItem('ship_calculator_common_resources');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 새로운 자원이 추가되었을 경우를 대비해 기본값과 병합
        const resources = {};
        Object.keys(COMMON_RESOURCES).forEach(key => {
          resources[key] = parsed[key] || 0;
        });
        return resources;
      }
    } catch (error) {
      console.warn('로컬스토리지에서 공통 자원 데이터 로드 실패:', error);
    }
    
    const resources = {};
    Object.keys(COMMON_RESOURCES).forEach(key => {
      resources[key] = 0;
    });
    return resources;
  });

  // 선박별 전용 자원 상태 관리 (로컬스토리지 연동)
  const [ownedShipResources, setOwnedShipResources] = useState(() => {
    try {
      const saved = localStorage.getItem('ship_calculator_ship_resources');
      if (saved) {
        const parsed = JSON.parse(saved);
        const resources = {};
        Object.keys(SHIP_SPECIFIC_RESOURCES).forEach(shipName => {
          resources[shipName] = {};
          Object.keys(SHIP_SPECIFIC_RESOURCES[shipName]).forEach(key => {
            resources[shipName][key] = parsed[shipName]?.[key] || 0;
          });
        });
        return resources;
      }
    } catch (error) {
      console.warn('로컬스토리지에서 선박 자원 데이터 로드 실패:', error);
    }
    
    const resources = {};
    Object.keys(SHIP_SPECIFIC_RESOURCES).forEach(shipName => {
      resources[shipName] = {};
      Object.keys(SHIP_SPECIFIC_RESOURCES[shipName]).forEach(key => {
        resources[shipName][key] = 0;
      });
    });
    return resources;
  });

  // 선택된 선박들의 전용 자원 목록 (동적)
  const selectedShipResources = useMemo(() => {
    const resources = {};
    Object.entries(selectedShips).forEach(([shipName, isSelected]) => {
      if (isSelected) {
        Object.assign(resources, SHIP_SPECIFIC_RESOURCES[shipName] || {});
      }
    });
    return resources;
  }, [selectedShips]);

  // 필요한 자원 계산 (선택된 모든 선박 합산)
  const requiredResources = useMemo(() => {
    const commonTotal = Object.keys(COMMON_RESOURCES).reduce((acc, key) => { acc[key] = 0; return acc; }, {});
    const shipTotal = {};

    // 선택된 각 선박에 대해 계산
    Object.entries(selectedShips).forEach(([shipName, isSelected]) => {
      if (!isSelected) return;

      const ship = SHIP_DATA[shipName];
      const currentLevel = currentLevels[shipName];
      
      if (!ship || currentLevel >= targetLevel) return;

      // 레벨별 자원 합산
      for (let level = currentLevel + 1; level <= targetLevel; level++) {
        const upgrade = ship.upgrades[level];
        if (upgrade) {
          Object.keys(upgrade).forEach(key => {
            if (commonTotal.hasOwnProperty(key)) {
              commonTotal[key] += upgrade[key];
            } else {
              // 선박 전용 자원
              if (!shipTotal[key]) shipTotal[key] = 0;
              shipTotal[key] += upgrade[key];
            }
          });
        }
      }
    });
    
    return { common: commonTotal, ship: shipTotal };
  }, [selectedShips, currentLevels, targetLevel]);

  // 실제로 필요한 자원만 필터링 (선택된 선박과 레벨 범위에 따라)
  const usedCommonResources = useMemo(() => {
    const used = {};
    Object.entries(COMMON_RESOURCES).forEach(([key, data]) => {
      if (requiredResources.common[key] > 0) {
        used[key] = data;
      }
    });
    return used;
  }, [requiredResources.common]);

  const usedShipResources = useMemo(() => {
    const used = {};
    Object.entries(selectedShipResources).forEach(([key, data]) => {
      if (requiredResources.ship[key] > 0) {
        used[key] = data;
      }
    });
    return used;
  }, [selectedShipResources, requiredResources.ship]);


  // 부족한 자원 계산
  const neededResources = useMemo(() => {
    const neededCommon = {};
    const neededShip = {};
    
    Object.keys(requiredResources.common).forEach(key => {
      neededCommon[key] = Math.max(0, requiredResources.common[key] - ownedCommonResources[key]);
    });
    
    Object.keys(requiredResources.ship).forEach(key => {
      // 모든 선택된 선박의 해당 자원 소지량을 합산
      let totalOwned = 0;
      Object.entries(selectedShips).forEach(([shipName, isSelected]) => {
        if (isSelected && ownedShipResources[shipName]?.[key]) {
          totalOwned += ownedShipResources[shipName][key];
        }
      });
      neededShip[key] = Math.max(0, requiredResources.ship[key] - totalOwned);
    });
    
    return { common: neededCommon, ship: neededShip };
  }, [requiredResources, ownedCommonResources, ownedShipResources, selectedShips]);

  // 로컬스토리지에 데이터 저장
  useEffect(() => {
    try {
      localStorage.setItem('ship_calculator_common_resources', JSON.stringify(ownedCommonResources));
    } catch (error) {
      console.warn('공통 자원 데이터 로컬스토리지 저장 실패:', error);
    }
  }, [ownedCommonResources]);

  useEffect(() => {
    try {
      localStorage.setItem('ship_calculator_ship_resources', JSON.stringify(ownedShipResources));
    } catch (error) {
      console.warn('선박 자원 데이터 로컬스토리지 저장 실패:', error);
    }
  }, [ownedShipResources]);

  useEffect(() => {
    try {
      localStorage.setItem('ship_calculator_selected_ships', JSON.stringify(selectedShips));
    } catch (error) {
      console.warn('선박 선택 데이터 로컬스토리지 저장 실패:', error);
    }
  }, [selectedShips]);

  useEffect(() => {
    try {
      localStorage.setItem('ship_calculator_current_levels', JSON.stringify(currentLevels));
    } catch (error) {
      console.warn('레벨 데이터 로컬스토리지 저장 실패:', error);
    }
  }, [currentLevels]);

  const handleCommonResourceChange = (resource, value) => {
    // 빈 문자열이면 0으로, 아니면 숫자로 변환 (앞의 0 자동 제거)
    const numValue = value === '' ? 0 : parseInt(value, 10) || 0;
    setOwnedCommonResources(prev => ({
      ...prev,
      [resource]: Math.max(0, numValue)
    }));
  };

  const handleShipResourceChange = (shipName, resource, value) => {
    // 빈 문자열이면 0으로, 아니면 숫자로 변환 (앞의 0 자동 제거)
    const numValue = value === '' ? 0 : parseInt(value, 10) || 0;
    setOwnedShipResources(prev => ({
      ...prev,
      [shipName]: {
        ...prev[shipName],
        [resource]: Math.max(0, numValue)
      }
    }));
  };

  const handleShipToggle = (shipName) => {
    setSelectedShips(prev => ({
      ...prev,
      [shipName]: !prev[shipName]
    }));
  };

  const handleCurrentLevelChange = (shipName, level) => {
    setCurrentLevels(prev => ({
      ...prev,
      [shipName]: level
    }));
  };

  // 모든 데이터 초기화 함수
  const resetAllResources = () => {
    if (confirm('모든 데이터를 초기화하시겠습니까? (선박 선택, 레벨, 자원)')) {
      // 공통 자원 초기화
      const resetCommon = {};
      Object.keys(COMMON_RESOURCES).forEach(key => {
        resetCommon[key] = 0;
      });
      setOwnedCommonResources(resetCommon);

      // 선박별 전용 자원 초기화
      const resetShip = {};
      Object.keys(SHIP_SPECIFIC_RESOURCES).forEach(shipName => {
        resetShip[shipName] = {};
        Object.keys(SHIP_SPECIFIC_RESOURCES[shipName]).forEach(key => {
          resetShip[shipName][key] = 0;
        });
      });
      setOwnedShipResources(resetShip);

      // 선박 선택 초기화
      setSelectedShips({
        '에스토크': false,
        '풍백': true,
        '바크스툼': false,
        '프뉴마': false,
        '브람스': false,
        '트라곤': false,
        '아스트레이': false,
        '에이번의 상처': false
      });

      // 레벨 초기화
      const resetLevels = {};
      Object.keys(SHIP_DATA).forEach(shipName => {
        resetLevels[shipName] = 1;
      });
      setCurrentLevels(resetLevels);

      // 로컬스토리지에서도 삭제
      localStorage.removeItem('ship_calculator_common_resources');
      localStorage.removeItem('ship_calculator_ship_resources');
      localStorage.removeItem('ship_calculator_selected_ships');
      localStorage.removeItem('ship_calculator_current_levels');
    }
  };

  const isUpgradePossible = useMemo(() => {
    const allNeededCommon = Object.values(neededResources.common).every(amount => amount === 0);
    const allNeededShip = Object.values(neededResources.ship).every(amount => amount === 0);
    return allNeededCommon && allNeededShip;
  }, [neededResources]);

  // 전체 재화 선택 변경 시 모든 개별 선택 업데이트
  const handleGlobalCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    if (currency && currency !== 'custom') {
      // 전체 선택 시 모든 자원에 동일한 재화 적용
      const newIndividual = {};
      Object.keys(usedCommonResources).forEach(key => {
        newIndividual[key] = currency;
      });
      Object.keys(usedShipResources).forEach(key => {
        newIndividual[key] = currency;
      });
      setIndividualCurrencies(newIndividual);
    } else if (!currency) {
      // 선택 안함 시 개별 선택 초기화
      setIndividualCurrencies({});
    }
  };

  // 개별 재화 선택 변경 시 전체 선택을 '사용자 지정'으로 변경
  const handleIndividualCurrencyChange = (resourceKey, currency) => {
    setIndividualCurrencies(prev => ({
      ...prev,
      [resourceKey]: currency || null
    }));
    setSelectedCurrency('custom');
  };

  // 총 필요 재화 계산 (개별 선택 기반)
  const totalCurrencyNeeded = useMemo(() => {
    const totals = {};
    
    // 공통 자원 비용 계산
    Object.entries(usedCommonResources).forEach(([key, data]) => {
      const needed = neededResources.common[key];
      const currency = individualCurrencies[key];
      if (needed > 0 && currency) {
        const price = data.prices?.[currency] || 0;
        if (price > 0) {
          if (!totals[currency]) totals[currency] = 0;
          totals[currency] += needed * price;
        }
      }
    });
    
    // 전용 자원 비용 계산
    Object.entries(usedShipResources).forEach(([key, data]) => {
      const needed = neededResources.ship[key];
      const currency = individualCurrencies[key];
      if (needed > 0 && currency) {
        const price = data.prices?.[currency] || 0;
        if (price > 0) {
          if (!totals[currency]) totals[currency] = 0;
          totals[currency] += needed * price;
        }
      }
    });
    
    return totals;
  }, [individualCurrencies, neededResources, usedCommonResources, usedShipResources]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-6 sm:p-8">
        {/* 헤더 */}
        <header className="mb-8 border-b pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Ship className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">선박 레벨업 계산기</h1>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                업적 체크리스트
              </Link>
            </div>
          </div>
          <p className="text-gray-600">선박 업그레이드에 필요한 자원을 계산해보세요</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 설정 패널 */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              선박 설정
            </h2>

            {/* 목표 레벨 (공통) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목표 레벨 (모든 선박 공통)
              </label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(parseInt(e.target.value))}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 10 }, (_, i) => i + 2).map(level => (
                  <option key={level} value={level}>
                    {level}레벨
                  </option>
                ))}
              </select>
            </div>

            {/* 선박 선택 및 현재 레벨 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                선박 선택 및 현재 레벨
              </label>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {Object.keys(SHIP_DATA).map(shipName => (
                  <div 
                    key={shipName} 
                    onClick={() => handleShipToggle(shipName)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors border cursor-pointer hover:shadow-sm ${
                      selectedShips[shipName] ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedShips[shipName]}
                      onChange={() => {}} // 빈 함수 (실제 토글은 div onClick에서 처리)
                      onClick={(e) => e.stopPropagation()} // 체크박스 클릭 시 이벤트 전파 방지
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 pointer-events-none"
                      readOnly
                    />
                    <span className={`flex-1 text-sm font-medium ${
                      selectedShips[shipName] ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {shipName}
                    </span>
                    <select
                      value={currentLevels[shipName]}
                      onChange={(e) => handleCurrentLevelChange(shipName, parseInt(e.target.value))}
                      onClick={(e) => e.stopPropagation()} // select 클릭 시 토글 방지
                      disabled={!selectedShips[shipName]}
                      className={`p-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !selectedShips[shipName] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {Array.from({ length: 11 }, (_, i) => i + 1).map(level => (
                        <option key={level} value={level}>
                          {level}레벨
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* 소지 자원 입력 (필요한 자원만 표시) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-800">소지 자원</h3>
                <button
                  onClick={resetAllResources}
                  className="flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 text-sm transition-colors"
                  title="모든 자원 데이터 초기화"
                >
                  <RotateCcw className="w-4 h-4" />
                  초기화
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                {/* 공통 자원 (필요한 것만) */}
                {Object.keys(usedCommonResources).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-blue-700 mb-2">공통 자원</h4>
                    <div className="space-y-2">
                      {Object.entries(usedCommonResources).map(([key, data]) => (
                        <div key={key} className="flex items-center gap-3">
                          <label className={`block text-sm font-medium min-w-0 flex-shrink-0 w-32 ${GRADE_COLORS[data.grade]}`}>
                            {data.name}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={ownedCommonResources[key] || ''}
                            onChange={(e) => handleCommonResourceChange(key, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 선택된 선박들의 전용 자원 (필요한 것만) */}
                {Object.keys(usedShipResources).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-purple-700 mb-2">선박 전용 자원</h4>
                    <div className="space-y-2">
                      {Object.entries(usedShipResources).map(([key, data]) => {
                        // 어느 선박의 자원인지 찾기
                        let owningShip = null;
                        Object.entries(selectedShips).forEach(([shipName, isSelected]) => {
                          if (isSelected && SHIP_SPECIFIC_RESOURCES[shipName]?.[key]) {
                            owningShip = shipName;
                          }
                        });
                        
                        if (!owningShip) return null;
                        
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <label className={`block text-sm font-medium min-w-0 flex-shrink-0 w-32 ${GRADE_COLORS[data.grade]}`}>
                              {data.name}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={ownedShipResources[owningShip]?.[key] || ''}
                              onChange={(e) => handleShipResourceChange(owningShip, key, e.target.value)}
                              onFocus={(e) => e.target.select()}
                              className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                              placeholder="0"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 필요 자원이 없는 경우 */}
                {Object.keys(usedCommonResources).length === 0 && 
                 Object.keys(usedShipResources).length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <p className="text-sm">선택한 선박과 레벨에서 필요 자원이 없습니다.</p>
                    <p className="text-xs mt-1">다른 선박을 선택하거나 목표 레벨을 조정해보세요.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 결과 패널 */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              자원 계산 결과
            </h2>

            {/* 필요 자원 (접을 수 있음) */}
            <div className="mb-6">
              <button
                onClick={() => setIsRequiredResourcesExpanded(!isRequiredResourcesExpanded)}
                className="flex items-center justify-between w-full p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors mb-3 border border-gray-200"
              >
                <h3 className="text-lg font-medium text-gray-800">필요 자원</h3>
                {isRequiredResourcesExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              {isRequiredResourcesExpanded && (
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {/* 공통 자원 필요량 */}
                  <div>
                    <h4 className="text-sm font-medium text-blue-700 mb-2">공통 자원</h4>
                    <div className="space-y-1">
                      {Object.entries(usedCommonResources).map(([key, data]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                          <span className={`text-sm font-medium ${GRADE_COLORS[data.grade]}`}>{data.name}</span>
                          <span className={`font-semibold text-sm ${GRADE_COLORS[data.grade]}`}>{requiredResources.common[key]}개</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 전용 자원 필요량 (합산) */}
                  <div>
                    <h4 className="text-sm font-medium text-purple-700 mb-2">선박 전용 자원 (합산)</h4>
                    <div className="space-y-1">
                      {Object.entries(usedShipResources).map(([key, data]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200">
                          <span className={`text-sm font-medium ${GRADE_COLORS[data.grade]}`}>{data.name}</span>
                          <span className={`font-semibold text-sm ${GRADE_COLORS[data.grade]}`}>{requiredResources.ship[key]}개</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {Object.values(requiredResources.common).every(val => val === 0) && 
                   Object.values(requiredResources.ship).every(val => val === 0) && (
                    <div className="text-center text-gray-400 py-4">
                      선택한 레벨 구간에서 필요 자원이 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 부족 자원 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-800">부족한 자원</h3>
                
                {/* 전체 재화 선택 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">전체 선택:</span>
                  <select
                    value={selectedCurrency || ''}
                    onChange={(e) => handleGlobalCurrencyChange(e.target.value || null)}
                    className="p-1.5 bg-white border border-gray-300 rounded text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택 안함</option>
                    {Object.entries(CURRENCY_TYPES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                    {selectedCurrency === 'custom' && (
                      <option value="custom">사용자 지정</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {/* 공통 자원 부족량 */}
                <div>
                  <h4 className="text-sm font-medium text-blue-700 mb-2">공통 자원</h4>
                  <div className="space-y-1">
                    {Object.entries(usedCommonResources).map(([key, data]) => {
                      const needed = neededResources.common[key];
                      const isShortage = needed > 0;
                      const currency = individualCurrencies[key];
                      const price = currency ? data.prices?.[currency] : 0;
                      const currencyCost = price > 0 ? needed * price : 0;
                      
                      // 교환 가능한 재화 목록
                      const availableCurrencies = Object.entries(data.prices || {})
                        .filter(([_, price]) => price > 0)
                        .map(([currencyKey]) => currencyKey);
                      
                      return (
                        <div key={key} className={`flex items-center gap-2 p-2 rounded-lg border ${
                          isShortage ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
                        }`}>
                          <span className={`text-sm font-medium flex-1 ${GRADE_COLORS[data.grade]}`}>{data.name}</span>
                          
                          {/* 개별 재화 선택 (부족하고 교환 가능한 경우만) */}
                          {isShortage && availableCurrencies.length > 0 && (
                            <select
                              value={currency || ''}
                              onChange={(e) => handleIndividualCurrencyChange(key, e.target.value || null)}
                              className="p-1 bg-white border border-gray-300 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">-</option>
                              {availableCurrencies.map(currencyKey => (
                                <option key={currencyKey} value={currencyKey}>
                                  {CURRENCY_TYPES[currencyKey]}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          <span className={`font-semibold text-sm whitespace-nowrap ${isShortage ? 'text-red-600' : 'text-green-600'}`}>
                            {needed}개 
                            {isShortage && currency && currencyCost > 0 && (
                              <span className="ml-1 text-xs text-orange-600">({currencyCost.toLocaleString()})</span>
                            )}
                            {!isShortage && ' ✓'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 전용 자원 부족량 (합산) */}
                <div>
                  <h4 className="text-sm font-medium text-purple-700 mb-2">선박 전용 자원 (합산)</h4>
                  <div className="space-y-1">
                    {Object.entries(usedShipResources).map(([key, data]) => {
                      const needed = neededResources.ship[key];
                      const isShortage = needed > 0;
                      const currency = individualCurrencies[key];
                      const price = currency ? data.prices?.[currency] : 0;
                      const currencyCost = price > 0 ? needed * price : 0;
                      
                      // 교환 가능한 재화 목록
                      const availableCurrencies = Object.entries(data.prices || {})
                        .filter(([_, price]) => price > 0)
                        .map(([currencyKey]) => currencyKey);
                      
                      return (
                        <div key={key} className={`flex items-center gap-2 p-2 rounded-lg border ${
                          isShortage ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
                        }`}>
                          <span className={`text-sm font-medium flex-1 ${GRADE_COLORS[data.grade]}`}>{data.name}</span>
                          
                          {/* 개별 재화 선택 (부족하고 교환 가능한 경우만) */}
                          {isShortage && availableCurrencies.length > 0 && (
                            <select
                              value={currency || ''}
                              onChange={(e) => handleIndividualCurrencyChange(key, e.target.value || null)}
                              className="p-1 bg-white border border-gray-300 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">-</option>
                              {availableCurrencies.map(currencyKey => (
                                <option key={currencyKey} value={currencyKey}>
                                  {CURRENCY_TYPES[currencyKey]}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          <span className={`font-semibold text-sm whitespace-nowrap ${isShortage ? 'text-red-600' : 'text-green-600'}`}>
                            {needed}개 
                            {isShortage && currency && currencyCost > 0 && (
                              <span className="ml-1 text-xs text-orange-600">({currencyCost.toLocaleString()})</span>
                            )}
                            {!isShortage && ' ✓'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {Object.values(requiredResources.common).every(val => val === 0) && 
                 Object.values(requiredResources.ship).every(val => val === 0) && (
                  <div className="text-center text-gray-400 py-4">
                    선택한 레벨 구간에서 필요 자원이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 총 필요 재화 (재화별로 표시) */}
            {Object.keys(totalCurrencyNeeded).length > 0 && (
              <div className="mb-4 p-4 rounded-lg border bg-orange-50 border-orange-200 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">총 필요 재화</h4>
                {Object.entries(totalCurrencyNeeded).map(([currencyKey, total]) => (
                  <div key={currencyKey} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {CURRENCY_TYPES[currencyKey]}:
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      {total.toLocaleString()}개
                    </span>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-orange-200">
                  * 선택한 재화로 부족한 자원을 구매할 경우
                </p>
              </div>
            )}

            {/* 업그레이드 가능 여부 */}
            <div className={`p-4 rounded-lg border ${
              isUpgradePossible 
                ? 'bg-green-50 border-green-300' 
                : 'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-center gap-2">
                {isUpgradePossible ? (
                  <ArrowUp className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`font-medium ${
                  isUpgradePossible ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {isUpgradePossible 
                    ? '업그레이드 가능합니다!' 
                    : '자원이 부족합니다.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
