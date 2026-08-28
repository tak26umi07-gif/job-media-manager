"use client";

type ExportButtonsProps = {
  jobId: string;
};

export default function ExportButtons({
  jobId,
}: ExportButtonsProps) {
  const handleExportCsv = () => {
    window.location.href = `/api/jobs/${jobId}/export`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleExportCsv}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        CSV出力
      </button>
    </div>
  );
}
