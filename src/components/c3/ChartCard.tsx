import {
  Chart as ChartJS,
  CategoryScale,
  ChartData,
  ChartOptions,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

type ChartCardProps = {
  title: string;
  subtitle?: string;
  type?: "line" | "bar";
  data: ChartData<"line" | "bar", (number | null)[], string>;
  options?: ChartOptions<"line" | "bar">;
  summary?: string;
};

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const, labels: { boxWidth: 12, usePointStyle: true } },
    tooltip: { mode: "index" as const, intersect: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.18)" } },
  },
};

export function ChartCard({ title, subtitle, type = "line", data, options, summary }: ChartCardProps) {
  const mergedOptions = { ...baseOptions, ...options };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#0B3538]">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="h-72">
        {type === "bar" ? (
          <Bar data={data as ChartData<"bar", (number | null)[], string>} options={mergedOptions as ChartOptions<"bar">} />
        ) : (
          <Line data={data as ChartData<"line", (number | null)[], string>} options={mergedOptions as ChartOptions<"line">} />
        )}
      </div>
      {summary && <p className="mt-3 text-xs leading-5 text-gray-600">{summary}</p>}
    </div>
  );
}
