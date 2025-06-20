import { type ElementType, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";

type SideBarProps = {
  children: ReactNode
}

export default function SideBar({ children }: SideBarProps) {
  return (
    <aside className="h-screen w-96 text-gray-500">
      <nav className="h-full border-r border-gray-300 shadow-sm flex flex-col">
        <div className="m-2 p-2 flex items-center justify-between">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/52/Free_logo.svg" alt="" className="w-32" />
        </div>
        <ul className="flex flex-col gap-2 p-2">{children}</ul>
        <div className="flex flex-1"></div>
        <div className="m-2 p-2 flex items-center justify-between border-t border-gray-500 shadow-xs">
          <div className="flex">
            <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce" alt="" className="w-13 h-13 rounded-full object-cover" />
            <h4 className="font-semibold p-2">Jane Doe</h4>
          </div>
          <MoreVertical size={25} className="text-gray-600 cursor-pointer" />
        </div>
      </nav>
    </aside>
  );
}

type SideBarItemProps = {
  icon: ElementType;
  text: string;
};

export function SideBarItem({ icon: Icon, text }: SideBarItemProps) {
  return (
    <li className="flex items-center gap-2 p-2 hover:bg-indigo-200 hover:text-indigo-500 rounded-md cursor-pointer group">
      <Icon size={30} className=" group-hover:text-indigo-500" />
      <span className="text-lg font-medium">{text}</span>
    </li>
  );
}
