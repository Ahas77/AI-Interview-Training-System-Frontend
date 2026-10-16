import { RefObject } from "react";

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  sessionId: number | null;
  qaId?: number | null;
  enabled: boolean;
  startedAt: number;
};

// Analysis belongs to the interview components; C3 consumes their numeric outputs.
export function CameraCoaching({ enabled }: Props) {
  return <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-slate-700">
    <p className="font-semibold text-teal-800">Delivery measurements</p>
    <p>C3 uses numeric expression indicators supplied by your interview analysis components. It does not send camera images to a separate AI service.</p>
    <p role="status" className="mt-2 text-xs leading-5">{enabled ? "Measurements appear after an analysis component supplies them. Missing readings stay unavailable." : "The camera or interview is currently inactive."}</p>
  </div>;
}
