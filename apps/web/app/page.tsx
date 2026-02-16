"use client";

import { useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const USER_ID = "94a52eb1-15b7-4e2c-bc46-c19de83c0b80";

type SearchResult = {
  id: string;
  originalUrl: string;
  title: string;
  score: number;
};

export default function Home() {
  const [linkUrl, setLinkUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSave = async () => {
    const input = linkUrl.trim();
    if (!input) {
      setSaveStatus("Please paste a link first.");
      return;
    }

    setSaveLoading(true);
    setSaveStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl: input }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save link.");
      }

      setSaveStatus("Link saved. Embedding is being generated.");
      setLinkUrl("");
    } catch (error) {
      setSaveStatus(
        error instanceof Error ? error.message : "Failed to save link.",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSearch = async () => {
    const input = searchQuery.trim();
    if (!input) {
      setSearchStatus("Enter a search query.");
      return;
    }

    setSearchLoading(true);
    setSearchStatus(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/links/search?q=${encodeURIComponent(
          input,
        )}&userId=${encodeURIComponent(USER_ID)}`,
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Search failed.");
      }

      const data = (await response.json()) as SearchResult[];
      setResults(data);
      if (data.length === 0) {
        setSearchStatus("No results found.");
      }
    } catch (error) {
      setSearchStatus(
        error instanceof Error ? error.message : "Search failed.",
      );
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Semantic Recall
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900">
            Build a memory of everything you read.
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            Save links, generate local embeddings, and search by meaning. All
            offline, all yours.
          </p>
        </header>

        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Paste a link
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="url"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://example.com/article"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={saveLoading}
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saveLoading ? "Saving..." : "Save"}
              </button>
            </div>
            {saveStatus && (
              <p className="text-sm text-slate-600">{saveStatus}</p>
            )}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Search your recall
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Type a concept or memory..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searchLoading}
                className="rounded-2xl border border-slate-900 px-6 py-3 text-sm font-medium text-slate-900 transition disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
              >
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </div>
            {searchStatus && (
              <p className="text-sm text-slate-600">{searchStatus}</p>
            )}
          </div>

          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {result.title || result.originalUrl}
                  </p>
                  <a
                    href={result.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 underline decoration-slate-300 underline-offset-4"
                  >
                    {result.originalUrl}
                  </a>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  Similarity score: {result.score.toFixed(4)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
