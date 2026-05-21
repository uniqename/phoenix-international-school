"use client";
import { useState } from "react";
import type { SchoolSettings } from "@/lib/types";
import toast from "react-hot-toast";

interface AIDraftingPanelProps {
  settings: SchoolSettings;
  onUpdate: (data: Partial<SchoolSettings>) => void;
}

export default function AIDraftingPanel({
  settings,
  onUpdate,
}: AIDraftingPanelProps) {
  const isEnabled = settings.ai_drafting_enabled;
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(settings.ai_model || "claude-3-haiku");

  const handleToggle = () => {
    onUpdate({ ai_drafting_enabled: !isEnabled });
    toast.success(
      isEnabled
        ? "AI drafting disabled"
        : "AI drafting enabled (set API key to use)"
    );
  };

  const handleSetKey = () => {
    if (!apiKey.trim()) {
      toast.error("API key required");
      return;
    }
    onUpdate({
      anthropic_api_key: apiKey,
      ai_model: model,
    });
    setApiKey("");
    setShowKeyForm(false);
    toast.success("API key saved securely");
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-1">
            🤖 AI Report Card Drafting
          </h3>
          <p className="text-xs text-gray-600">
            Auto-generate report card narratives powered by Claude AI
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`px-3 py-1 text-xs font-bold rounded-full transition ${
            isEnabled
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isEnabled ? "✓ Enabled" : "○ Disabled"}
        </button>
      </div>

      {/* Status */}
      <div className="text-xs space-y-1">
        <p>
          <span className="text-gray-600">API Key:</span>{" "}
          <span className="font-mono text-gray-900">
            {settings.anthropic_api_key ? "••••••••" : "Not set"}
          </span>
        </p>
        <p>
          <span className="text-gray-600">Model:</span>{" "}
          <span className="font-mono text-gray-900">{model}</span>
        </p>
      </div>

      {/* Key Form */}
      {showKeyForm && (
        <div className="space-y-2 p-3 bg-white rounded-lg border border-purple-200">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Get a key from{" "}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="claude-3-haiku">Claude 3 Haiku (Fast, cheap)</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet (Balanced)</option>
              <option value="claude-3-opus">Claude 3 Opus (Best quality)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSetKey}
              className="flex-1 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition"
            >
              Save Key
            </button>
            <button
              type="button"
              onClick={() => setShowKeyForm(false)}
              className="flex-1 px-2 py-1 bg-gray-200 text-gray-900 text-xs font-bold rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!showKeyForm && (
        <button
          type="button"
          onClick={() => setShowKeyForm(true)}
          className="w-full px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition"
        >
          {settings.anthropic_api_key ? "🔄 Update Key" : "🔑 Set API Key"}
        </button>
      )}

      {/* Features */}
      <div className="border-t pt-3">
        <p className="text-xs font-bold text-gray-700 mb-2">Features:</p>
        <ul className="text-[10px] text-gray-600 space-y-1 list-disc list-inside">
          <li>Auto-draft term report narratives</li>
          <li>Suggest praise/improvement comments</li>
          <li>Adapt tone per age group</li>
          <li>Integrate with grading results</li>
        </ul>
      </div>

      {/* Tip */}
      {isEnabled && !settings.anthropic_api_key && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-900">
          <p className="font-bold mb-1">⚠️ Setup Required</p>
          <p>
            Set your API key above to enable AI drafting. Teachers can then
            request draft narratives from the report card UI.
          </p>
        </div>
      )}
    </div>
  );
}
