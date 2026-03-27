import { NavLink } from "react-router-dom";
import type { MainTab } from "@src/app/navigation";

export default function Tabs({ tabs }: { tabs: MainTab[] }) {
  return (
    <div className="border-b">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <nav className="flex gap-3" aria-label="Primary tabs">
          {tabs.map((t) => (
            <NavLink
              key={t.id}
              to={t.path}
              className={({ isActive }) =>
                [
                  "px-4 py-2 -mb-px border-b-2 transition-colors",
                  isActive ? "border-black font-semibold" : "border-transparent text-gray-500 hover:text-black",
                ].join(" ")
              }
              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            >
              {t.title}
            </NavLink>
          ))}
        </nav> 
      </div>
    </div>
  );
}