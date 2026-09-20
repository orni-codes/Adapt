import React, { useEffect, useRef } from 'react';

/**
 * DNAVisualization
 * Refined technical DNA visualization with
 * floating learning-concept labels.
 */
export default function DNAVisualization({
  className = '',
  height = 480,
  width = 320,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Support device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.scale(dpr, dpr);

    let time = 0;

    const nodeCount = 14;
    const amplitude = width * 0.28;
    const centerX = width / 2;

    const verticalPadding = 30;
    const usableHeight =
      height - verticalPadding * 2;

    const stepY =
      usableHeight / (nodeCount - 1);

    // Decorative floating particles
    const particles = Array.from(
      { length: 8 },
      (_, i) => ({
        x:
          centerX +
          Math.sin(i * 1.5) *
            amplitude *
            1.2,

        y:
          verticalPadding +
          (i * stepY * 1.6) %
            usableHeight,

        size:
          1.5 + Math.random(),

        speed:
          0.005 +
          Math.random() * 0.005,

        offset: i * 1.2,

        cyan: i % 2 === 0,
      })
    );

    const render = () => {
      time += 0.015;

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      // Points array for both strands
      const strandA = [];
      const strandB = [];

      for (
        let i = 0;
        i < nodeCount;
        i++
      ) {
        const y =
          verticalPadding +
          i * stepY;

        const phase =
          (i / nodeCount) *
            Math.PI *
            2.8 +
          time;

        const xOffset =
          Math.sin(phase) *
          amplitude;

        const depth =
          Math.cos(phase);

        strandA.push({
          x: centerX + xOffset,
          y,
          depth,
          phase,
        });

        strandB.push({
          x: centerX - xOffset,
          y,
          depth: -depth,
          phase:
            phase + Math.PI,
        });
      }

      // Draw connecting rungs
      for (
        let i = 0;
        i < nodeCount;
        i++
      ) {
        const pA =
          strandA[i];

        const pB =
          strandB[i];

        ctx.beginPath();

        ctx.moveTo(
          pA.x,
          pA.y
        );

        ctx.lineTo(
          pB.x,
          pB.y
        );

        const rungAlpha =
          0.12 +
          Math.abs(pA.depth) *
            0.18;

        ctx.strokeStyle =
          `rgba(0, 199, 212, ${rungAlpha})`;

        ctx.lineWidth = 1;

        ctx.stroke();

        // Midpoint accents
        if (i % 2 === 0) {
          const midX =
            (pA.x + pB.x) / 2;

          const midY =
            (pA.y + pB.y) / 2;

          ctx.beginPath();

          ctx.arc(
            midX,
            midY,
            1.2,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            'rgba(0, 199, 212, 0.4)';

          ctx.fill();
        }
      }

      // Helper to draw continuous smooth strand
      const drawStrandCurve = (
        points,
        color
      ) => {
        ctx.beginPath();

        for (
          let i = 0;
          i < points.length;
          i++
        ) {
          const p =
            points[i];

          if (i === 0) {
            ctx.moveTo(
              p.x,
              p.y
            );
          } else {
            const prev =
              points[i - 1];

            const cx =
              (prev.x + p.x) /
              2;

            const cy =
              (prev.y + p.y) /
              2;

            ctx.quadraticCurveTo(
              prev.x,
              prev.y,
              cx,
              cy
            );
          }
        }

        const last =
          points[
            points.length - 1
          ];

        ctx.lineTo(
          last.x,
          last.y
        );

        ctx.strokeStyle =
          color;

        ctx.lineWidth = 1.3;

        ctx.stroke();
      };

      // Draw strands
      drawStrandCurve(
        strandA,
        'rgba(0, 199, 212, 0.65)'
      );

      drawStrandCurve(
        strandB,
        'rgba(0, 199, 212, 0.45)'
      );

      // Draw nodes
      const allNodes = [
        ...strandA.map((p) => ({
          ...p,
          isPrimary: true,
        })),

        ...strandB.map((p) => ({
          ...p,
          isPrimary: false,
        })),
      ];

      // Front nodes over back nodes
      allNodes.sort(
        (a, b) =>
          a.depth - b.depth
      );

      allNodes.forEach(
        (node) => {
          const radius =
            2.2 +
            (node.depth + 1) *
              0.8;

          const alpha =
            0.4 +
            (node.depth + 1) *
              0.3;

          // Glowing halo
          if (
            node.depth > 0.4
          ) {
            const glowGrad =
              ctx.createRadialGradient(
                node.x,
                node.y,
                0,
                node.x,
                node.y,
                radius * 3.5
              );

            glowGrad.addColorStop(
              0,
              `rgba(0, 199, 212, ${
                0.45 * alpha
              })`
            );

            glowGrad.addColorStop(
              1,
              'rgba(0, 199, 212, 0)'
            );

            ctx.beginPath();

            ctx.arc(
              node.x,
              node.y,
              radius * 3.5,
              0,
              Math.PI * 2
            );

            ctx.fillStyle =
              glowGrad;

            ctx.fill();
          }

          // Inner node
          ctx.beginPath();

          ctx.arc(
            node.x,
            node.y,
            radius,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            node.isPrimary
              ? `rgba(200, 250, 255, ${alpha})`
              : `rgba(0, 199, 212, ${alpha})`;

          ctx.fill();
        }
      );

      // Floating particles
      particles.forEach(
        (pt, idx) => {
          const currentY =
            (pt.y +
              Math.sin(
                time + pt.offset
              ) *
                12) %
              usableHeight +
            verticalPadding;

          const currentX =
            pt.x +
            Math.cos(
              time * 0.8 +
                pt.offset
            ) *
              16;

          ctx.beginPath();

          ctx.arc(
            currentX,
            currentY,
            pt.size,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            pt.cyan
              ? 'rgba(0, 199, 212, 0.4)'
              : 'rgba(129, 140, 248, 0.35)';

          ctx.fill();

          // Hairline connections
          if (idx % 3 === 0) {
            const nearestNode =
              strandA[
                (idx * 2) %
                  nodeCount
              ];

            if (nearestNode) {
              ctx.beginPath();

              ctx.moveTo(
                currentX,
                currentY
              );

              ctx.lineTo(
                nearestNode.x,
                nearestNode.y
              );

              ctx.strokeStyle =
                'rgba(0, 199, 212, 0.08)';

              ctx.lineWidth =
                0.8;

              ctx.stroke();
            }
          }
        }
      );

      animationFrameId =
        requestAnimationFrame(
          render
        );
    };

    render();

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );
    };
  }, [height, width]);

  /*
   * Floating concept labels.
   *
   * Positions are percentages so they
   * adapt when width/height changes.
   */
  const concepts = [
    {
      text: 'Visual reasoning',
      top: '13%',
      left: '2%',
    },
    {
      text: 'Active recall',
      top: '30%',
      right: '0%',
    },
    {
      text: 'Example-based learning',
      top: '48%',
      left: '-4%',
    },
    {
      text: 'Teach-back',
      top: '67%',
      right: '0%',
    },
    {
      text: 'Passive reading',
      top: '80%',
      left: '10%',
    },
  ];

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* DNA */}
      <canvas
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        className="block"
      />

      {/* Floating concept labels */}
      {concepts.map(
        (concept, index) => (
          <div
            key={index}
            className="
              absolute
              z-10
              pointer-events-none
              whitespace-nowrap
              rounded-xl
              border
              border-cyan-200/40
              bg-cyan-950/20
              p-4
              px-2.5
              py-1
              font-medium
              tracking-tight
              text-cyan-100
              backdrop-blur-[3px]
              shadow-[0_0_35px_rgba(0,199,212,0.04)]
            "
            style={{
              top: concept.top,
              left: concept.left,
              right: concept.right,
              animationDelay:
                concept.delay,
            }}
          >
            {concept.text}
          </div>
        )
      )}

    
      
    </div>
  );
}
