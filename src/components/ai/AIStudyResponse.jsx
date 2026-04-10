import React from "react";

export default function AIStudyResponse({ result, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
          <div className="h-32 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
        {error}
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-lg">
        <h3 className="text-2xl font-bold">{result.title}</h3>
        <p className="mt-2 text-white/90">{result.summary}</p>
      </div>

      {result.type === "studyPlans" && (
        <>
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">Daily plan</h4>
            <div className="mt-4 grid gap-4">
              {result.days.map((day, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-violet-700">{day.day}</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{day.title}</div>
                  <div className="mt-2 text-sm text-slate-600">Reading: {day.reading}</div>
                  <div className="mt-2 text-slate-700">{day.reflection}</div>
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-slate-700">
                    {day.prayer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">Key verses</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.keyVerses.map((v, i) => (
                <span
                  key={i}
                  className="rounded-full bg-violet-50 px-3 py-1 text-sm text-violet-700"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {result.type === "passages" && (
        <>
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">Context</h4>
            <p className="mt-3 text-slate-700">{result.context}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Key themes</h4>
              <ul className="mt-3 space-y-2 text-slate-700">
                {result.keyThemes.map((x, i) => (
                  <li key={i}>• {x}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Application</h4>
              <ul className="mt-3 space-y-2 text-slate-700">
                {result.application.map((x, i) => (
                  <li key={i}>• {x}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">Prayer</h4>
            <p className="mt-3 text-slate-700">{result.prayer}</p>
          </div>
        </>
      )}

      {result.type === "theology" && (
        <>
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">Explanation</h4>
            <p className="mt-3 text-slate-700">{result.explanation}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Supporting passages</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.supportingPassages.map((x, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">
                Practical application
              </h4>
              <ul className="mt-3 space-y-2 text-slate-700">
                {result.practicalApplication.map((x, i) => (
                  <li key={i}>• {x}</li>
                ))}
              </ul>
            </div>
          </div>

          {result.cautions?.length ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-amber-900">Cautions</h4>
              <ul className="mt-3 space-y-2 text-amber-800">
                {result.cautions.map((x, i) => (
                  <li key={i}>• {x}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}