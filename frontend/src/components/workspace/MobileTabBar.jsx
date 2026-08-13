import { FileSpreadsheet, BarChart2, MessageSquare } from 'lucide-react';

const TABS = [
  { key: 'data', label: 'Data', icon: FileSpreadsheet },
  { key: 'canvas', label: 'Canvas', icon: BarChart2 },
  { key: 'chat', label: 'Chat', icon: MessageSquare },
];

/**
 * Bottom tab bar for mobile/tablet workspace.
 * Fixed to the bottom with safe-area padding for notched phones.
 * Touch-friendly 44px+ tap targets per Apple HIG.
 */
export function MobileTabBar({ activeTab, onTabChange, chatUnread }) {
  return (
    <nav
      className="flex items-center justify-around border-t border-[#e5e0da] bg-[#f5f2ed] flex-shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        const TabIcon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center justify-center gap-0.5 py-2.5 px-4 min-w-[72px] min-h-[52px] transition-colors relative ${
              active
                ? 'text-[#1a3c2e]'
                : 'text-[#a8a29e] active:text-[#6b6b6b]'
            }`}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <TabIcon size={20} strokeWidth={active ? 2.2 : 1.8} />
            <span className={`text-[10px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
              {tab.label}
            </span>
            {/* Unread dot for chat tab */}
            {tab.key === 'chat' && chatUnread && (
              <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-[#1a3c2e] ring-2 ring-[#f5f2ed]" />
            )}
            {/* Active indicator bar */}
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-[#1a3c2e]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
