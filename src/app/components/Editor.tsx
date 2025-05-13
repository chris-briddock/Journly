"use client";

import { TipTapEditor } from "./TipTapEditor";

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function Editor({ value, onChange, placeholder }: EditorProps) {
  return (
    <TipTapEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
