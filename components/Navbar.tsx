"use client";

import { useUser } from "@/contexts/UserContext";
import { Menu, User as UserIcon } from "lucide-react";

export default function Navbar() {
    const { user } = useUser();

    return (
        <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div>
                {/* Can be used for breadcrumbs or page title */}
            </div>
            <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">{user?.name || 'Guest'}</span>
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-500" />
                </div>
            </div>
        </nav>
    );
}
