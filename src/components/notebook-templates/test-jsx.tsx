"use client";
export function TestJsx() {
  const list: string[] = [];
  const filtered = list.filter((x) => {
    return true;
  });
  return (
    <div className="root">
      <span>test</span>
    </div>
  );
}
