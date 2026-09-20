import React, { useEffect, useState } from 'react';

/**
 * GraphVisualisation
 *
 * Dynamic radar / spider chart.
 *
 * Hover over a metric point to see its
 * current dynamic percentage.
 */

export default function GraphVisualisation({
  data = {},
  className = '',
  size = 320,
}) {
  const [animatedValues, setAnimatedValues] =
    useState({
      visual: 0,
      examples: 0,
      recall: 0,
      teachBack: 0,
      passiveReading: 0,
    });

  const [hoveredMetric, setHoveredMetric] =
    useState(null);

  /*
   * ============================================================
   * METRICS
   * ============================================================
   *
   * These keys MUST match the data passed from
   * LearningDNA.jsx.
   */

  const labels = [
    {
      key: 'visual',
      label: 'Visual',
      fullLabel: 'Visual reasoning',
    },
    {
      key: 'examples',
      label: 'Examples',
      fullLabel: 'Example-based learning',
    },
    {
      key: 'recall',
      label: 'Recall',
      fullLabel: 'Active recall',
    },
    {
      key: 'teachBack',
      label: 'Teach-back',
      fullLabel: 'Teach-back',
    },
    {
      key: 'passiveReading',
      label: 'Passive reading',
      fullLabel: 'Passive reading',
    },
  ];

  /*
   * ============================================================
   * ANIMATE DATA CHANGES
   * ============================================================
   */

  useEffect(() => {
    const target = {
      visual: clamp(data.visual),
      examples: clamp(data.examples),
      recall: clamp(data.recall),
      teachBack: clamp(data.teachBack),
      passiveReading: clamp(
        data.passiveReading
      ),
    };

    const startValues = {
      ...animatedValues,
    };

    const startTime = performance.now();
    const duration = 900;

    let animationFrame;

    const animate = (currentTime) => {
      const elapsed =
        currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      /*
       * Smooth ease-out.
       */
      const eased =
        1 -
        Math.pow(1 - progress, 3);

      setAnimatedValues({
        visual:
          startValues.visual +
          (target.visual -
            startValues.visual) *
            eased,

        examples:
          startValues.examples +
          (target.examples -
            startValues.examples) *
            eased,

        recall:
          startValues.recall +
          (target.recall -
            startValues.recall) *
            eased,

        teachBack:
          startValues.teachBack +
          (target.teachBack -
            startValues.teachBack) *
            eased,

        passiveReading:
          startValues.passiveReading +
          (target.passiveReading -
            startValues.passiveReading) *
            eased,
      });

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(
            animate
          );
      }
    };

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };

    // We intentionally only react to incoming data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data.visual,
    data.examples,
    data.recall,
    data.teachBack,
    data.passiveReading,
  ]);

  /*
   * ============================================================
   * CHART GEOMETRY
   * ============================================================
   */

  const center = size / 2;

  const radius =
    size * 0.32;

  const labelRadius =
    size * 0.46;

  const levels = 4;

  const angleStep =
    (Math.PI * 2) /
    labels.length;

  /*
   * Get a data point.
   */
  const getPoint = (
    value,
    index,
    pointRadius = radius
  ) => {
    const angle =
      -Math.PI / 2 +
      index * angleStep;

    const distance =
      pointRadius *
      (value / 100);

    return {
      x:
        center +
        Math.cos(angle) *
          distance,

      y:
        center +
        Math.sin(angle) *
          distance,
    };
  };

  /*
   * Get an outer point.
   */
  const getOuterPoint = (
    index,
    pointRadius = radius
  ) => {
    const angle =
      -Math.PI / 2 +
      index * angleStep;

    return {
      x:
        center +
        Math.cos(angle) *
          pointRadius,

      y:
        center +
        Math.sin(angle) *
          pointRadius,
    };
  };

  /*
   * ============================================================
   * RADAR GRID
   * ============================================================
   */

  const gridPolygons = [];

  for (
    let level = 1;
    level <= levels;
    level++
  ) {
    const levelRadius =
      radius *
      (level / levels);

    const points = labels
      .map((_, index) => {
        const point =
          getOuterPoint(
            index,
            levelRadius
          );

        return `${point.x},${point.y}`;
      })
      .join(' ');

    gridPolygons.push(points);
  }

  /*
   * ============================================================
   * AXIS LINES
   * ============================================================
   */

  const axisLines = labels.map(
    (_, index) => {
      const point =
        getOuterPoint(index);

      return {
        x1: center,
        y1: center,
        x2: point.x,
        y2: point.y,
      };
    }
  );

  /*
   * ============================================================
   * DYNAMIC DATA POLYGON
   * ============================================================
   */

  const dataPoints = labels
    .map((item, index) => {
      const point =
        getPoint(
          animatedValues[
            item.key
          ],
          index
        );

      return `${point.x},${point.y}`;
    })
    .join(' ');

  /*
   * ============================================================
   * HOVERED POINT
   * ============================================================
   */

  const hoveredIndex =
    hoveredMetric !== null
      ? labels.findIndex(
          (item) =>
            item.key ===
            hoveredMetric
        )
      : -1;

  let tooltipPosition = null;

  if (hoveredIndex !== -1) {
    const point =
      getPoint(
        animatedValues[
          hoveredMetric
        ],
        hoveredIndex
      );

    tooltipPosition = {
      x: point.x,
      y: point.y,
    };
  }

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* =================================================
            GRID
        ================================================== */}

        {gridPolygons.map(
          (points, index) => (
            <polygon
              key={index}
              points={points}
              fill={
                index === levels - 1
                  ? 'rgba(0, 199, 212, 0.025)'
                  : 'transparent'
              }
              stroke="rgba(148, 163, 184, 0.16)"
              strokeWidth="1"
            />
          )
        )}

        {/* =================================================
            AXIS LINES
        ================================================== */}

        {axisLines.map(
          (line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth="1"
            />
          )
        )}

        {/* =================================================
            CENTER POINT
        ================================================== */}

        <circle
          cx={center}
          cy={center}
          r="2"
          fill="#00C7D4"
          opacity="0.35"
        />

        {/* =================================================
            DATA AREA
        ================================================== */}

        <polygon
          points={dataPoints}
          fill="rgba(0, 199, 212, 0.12)"
          stroke="none"
        />

        {/* =================================================
            DATA OUTLINE
        ================================================== */}

        <polygon
          points={dataPoints}
          fill="rgba(0, 199, 212, 0.08)"
          stroke="#00C7D4"
          strokeWidth="1.7"
          strokeLinejoin="round"
          style={{
            filter:
              'drop-shadow(0 0 4px rgba(0,199,212,0.25))',
          }}
        />

        {/* =================================================
            DATA POINTS
        ================================================== */}

        {labels.map(
          (item, index) => {
            const point =
              getPoint(
                animatedValues[
                  item.key
                ],
                index
              );

            const isHovered =
              hoveredMetric ===
              item.key;

            return (
              <g
                key={item.key}
                onMouseEnter={() =>
                  setHoveredMetric(
                    item.key
                  )
                }
                onMouseLeave={() =>
                  setHoveredMetric(
                    null
                  )
                }
                style={{
                  cursor: 'pointer',
                }}
              >
                {/* Larger invisible hit area */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="14"
                  fill="transparent"
                />

                {/* Hover glow */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={
                    isHovered
                      ? 11
                      : 7
                  }
                  fill="#00C7D4"
                  opacity={
                    isHovered
                      ? 0.18
                      : 0.08
                  }
                  style={{
                    transition:
                      'all 200ms ease',
                  }}
                />

                {/* Actual point */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={
                    isHovered
                      ? 4.5
                      : 3
                  }
                  fill="#00C7D4"
                  style={{
                    transition:
                      'all 200ms ease',
                    filter: isHovered
                      ? 'drop-shadow(0 0 5px rgba(0,199,212,0.8))'
                      : 'none',
                  }}
                />
              </g>
            );
          }
        )}

        {/* =================================================
            LABELS
        ================================================== */}

        {labels.map(
          (item, index) => {
            const point =
              getOuterPoint(
                index,
                labelRadius
              );

            let anchor =
              'middle';

            if (
              point.x <
              center - 10
            ) {
              anchor = 'end';
            } else if (
              point.x >
              center + 10
            ) {
              anchor = 'start';
            }

            let y = point.y;

            if (index === 0) {
              y -= 3;
            }

            return (
              <text
                key={item.key}
                x={point.x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill={
                  hoveredMetric ===
                  item.key
                    ? '#C8FAFF'
                    : '#8B96A8'
                }
                fontSize="16"
                fontFamily="monospace"
                letterSpacing="0.2"
                style={{
                  cursor: 'pointer',
                  transition:
                    'fill 200ms ease',
                }}
                onMouseEnter={() =>
                  setHoveredMetric(
                    item.key
                  )
                }
                onMouseLeave={() =>
                  setHoveredMetric(
                    null
                  )
                }
              >
                {item.label}
              </text>
            );
          }
        )}
      </svg>

      {/* =====================================================
          DYNAMIC VALUE TOOLTIP
      ====================================================== */}

      {hoveredMetric &&
        tooltipPosition && (
          <div
            className="
              absolute
              z-20
              pointer-events-none
              rounded-lg
              border
              border-cyan-300/20
              bg-[#071014]/90
              px-3
              py-2
              backdrop-blur-md
              shadow-[0_0_20px_rgba(0,199,212,0.15)]
              transition-all
              duration-150
              whitespace-nowrap
            "
            style={{
              left:
                tooltipPosition.x,
              top:
                tooltipPosition.y,
              transform:
                'translate(-50%, -125%)',
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.15em] text-[#7E8B9B] font-mono">
              {
                labels.find(
                  (item) =>
                    item.key ===
                    hoveredMetric
                )?.fullLabel
              }
            </div>

            <div className="mt-0.5 text-lg font-semibold text-[#C8FAFF] font-mono">
              {Math.round(
                animatedValues[
                  hoveredMetric
                ]
              )}
              <span className="text-[#00C7D4] text-sm ml-0.5">
                %
              </span>
            </div>
          </div>
        )}
    </div>
  );
}

/*
 * ============================================================
 * CLAMP
 * ============================================================
 */

function clamp(value) {
  const number =
    Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.min(
    Math.max(number, 0),
    100
  );
}