"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  applyBazarSuggestion,
  filterBazarSuggestions,
  getBazarSuggestionQuery,
} from "@/lib/bazar-items";

export default function BazarDescriptionInput({
  value,
  onChange,
  placeholder = "murgi, sobji, dim",
  className = "input-field",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const query = getBazarSuggestionQuery(value);
  const suggestions = open && query.length > 0 ? filterBazarSuggestions(query) : [];
  const showList = open && suggestions.length > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [query, suggestions.length]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pickSuggestion(item: string) {
    onChange(applyBazarSuggestion(value, item));
    setOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && suggestions[activeIndex]) {
      e.preventDefault();
      pickSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={className}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-autocomplete="list"
        autoComplete="off"
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-100"
        >
          {suggestions.map((item, index) => (
            <li key={item} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickSuggestion(item)}
                className={`flex w-full px-3 py-2.5 text-left text-sm transition ${
                  index === activeIndex
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
