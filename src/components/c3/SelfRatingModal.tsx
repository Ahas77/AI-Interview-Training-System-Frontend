import { useState } from "react";
import { toast } from "react-toastify";
import { c3Api } from "../../app/progress/c3Api";
import { getErrorMessage } from "../../app/progress/errorUtils";

type SelfRatingModalProps = {
  sessionId: number | null;
  isOpen: boolean;
  onClose: () => void;
};

export function SelfRatingModal({ sessionId, isOpen, onClose }: SelfRatingModalProps) {
  const [improvementRating, setImprovementRating] = useState(3);
  const [tipClarityRating, setTipClarityRating] = useState<number | "">("");
  const [tipUsefulnessRating, setTipUsefulnessRating] = useState<number | "">("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen || !sessionId) return null;

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await c3Api.saveSelfRating({
        sessionId,
        improvementRating,
        tipClarityRating: tipClarityRating === "" ? null : Number(tipClarityRating),
        tipUsefulnessRating: tipUsefulnessRating === "" ? null : Number(tipUsefulnessRating),
        comment,
      });
      toast.success("Self-rating saved.");
      onClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save self-rating."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-[#0B3538]">How much do you feel you improved this session?</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">This research rating helps compare fixed-threshold progress with progress compared with your own baseline.</p>

        <div className="mt-5 grid gap-4">
          <label className="text-sm font-semibold text-gray-700">
            Improvement rating
            <select value={improvementRating} onChange={(e) => setImprovementRating(Number(e.target.value))} className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2">
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Tip clarity
            <select value={tipClarityRating} onChange={(e) => setTipClarityRating(e.target.value ? Number(e.target.value) : "")} className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2">
              <option value="">Optional</option>
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Tip usefulness
            <select value={tipUsefulnessRating} onChange={(e) => setTipUsefulnessRating(e.target.value ? Number(e.target.value) : "")} className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2">
              <option value="">Optional</option>
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Comment
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="mt-1 block w-full resize-none rounded-xl border border-gray-300 px-3 py-2" />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Later
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving} className="rounded-xl bg-[#0E8C86] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C7873] disabled:opacity-70">
            {saving ? "Saving..." : "Save rating"}
          </button>
        </div>
      </div>
    </div>
  );
}
