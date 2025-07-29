import { useEffect, useRef } from "react";

interface RiskChartProps {
  data?: {
    low: number;
    medium: number;
    high: number;
  };
}

export default function RiskChart({ data }: RiskChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 200;
    canvas.height = 200;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    const innerRadius = 50;

    const total = data.low + data.medium + data.high;
    if (total === 0) {
      // Draw empty state
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 30;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 15, 0, 2 * Math.PI);
      ctx.stroke();
      return;
    }

    // Calculate angles
    const lowAngle = (data.low / total) * 2 * Math.PI;
    const mediumAngle = (data.medium / total) * 2 * Math.PI;
    const highAngle = (data.high / total) * 2 * Math.PI;

    let currentAngle = -Math.PI / 2; // Start at top

    // Draw low risk segment
    if (data.low > 0) {
      ctx.strokeStyle = "#059669"; // green-600
      ctx.lineWidth = 30;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 15, currentAngle, currentAngle + lowAngle);
      ctx.stroke();
      currentAngle += lowAngle;
    }

    // Draw medium risk segment
    if (data.medium > 0) {
      ctx.strokeStyle = "#d97706"; // orange-600
      ctx.lineWidth = 30;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 15, currentAngle, currentAngle + mediumAngle);
      ctx.stroke();
      currentAngle += mediumAngle;
    }

    // Draw high risk segment
    if (data.high > 0) {
      ctx.strokeStyle = "#dc2626"; // red-600
      ctx.lineWidth = 30;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 15, currentAngle, currentAngle + highAngle);
      ctx.stroke();
    }

    // Draw center text
    ctx.fillStyle = "#374151";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total.toString(), centerX, centerY - 5);
    
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("Total", centerX, centerY + 15);

  }, [data]);

  return (
    <div className="flex items-center justify-center h-48">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{ width: "200px", height: "200px" }}
      />
    </div>
  );
}
