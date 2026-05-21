"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface SettlementRow {
  reference: string;
  amount: number;
  settled_on?: string;
}

interface SettlementImportModalProps {
  onImport: (rows: SettlementRow[]) => void;
  onClose: () => void;
}

export default function SettlementImportModal({
  onImport,
  onClose,
}: SettlementImportModalProps) {
  const [csv, setCSV] = useState("");
  const [preview, setPreview] = useState<SettlementRow[]>([]);

  const handleCSVChange = (value: string) => {
    setCSV(value);
    try {
      const lines = value.trim().split("\n");
      if (lines.length < 2) {
        setPreview([]);
        return;
      }
      const rows: SettlementRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const [reference, amountStr, settled_on] = lines[i].split(",").map((v) => v.trim());
        if (reference && amountStr) {
          rows.push({
            reference,
            amount: parseFloat(amountStr),
            settled_on: settled_on || undefined,
          });
        }
      }
      setPreview(rows);
    } catch (err) {
      toast.error("Invalid CSV format");
      setPreview([]);
    }
  };

  const handleImport = () => {
    if (preview.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    onImport(preview);
    toast.success(`${preview.length} settlements imported`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-black text-gray-900 mb-4">💳 Import Paystack Settlement</h2>

        <div className="space-y-4">
          {/* CSV Format Help */}
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-900">
            <p className="font-bold mb-2">CSV Format (comma-separated):</p>
            <pre className="text-[10px] overflow-auto">
              reference,amount,settled_on
              {"\n"}
              pay_1234567890,50000,2026-05-21
              {"\n"}
              pay_0987654321,75000,2026-05-21
            </pre>
          </div>

          {/* CSV Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Paste Paystack Settlement CSV
            </label>
            <textarea
              value={csv}
              onChange={(e) => handleCSVChange(e.target.value)}
              placeholder="Paste CSV data here..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">
                ✅ Preview ({preview.length} rows)
              </p>
              <div className="max-h-40 overflow-auto space-y-1">
                {preview.slice(0, 10).map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                  >
                    <span className="text-gray-600 truncate">{row.reference}</span>
                    <span className="font-bold text-gray-900">
                      GHS {row.amount.toFixed(2)}
                    </span>
                    <span className="text-gray-400 text-[10px]">
                      {row.settled_on || "today"}
                    </span>
                  </div>
                ))}
                {preview.length > 10 && (
                  <p className="text-center text-gray-400 py-2">
                    +{preview.length - 10} more rows...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleImport}
              disabled={preview.length === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ✅ Import {preview.length} Settlements
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
