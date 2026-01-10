"use client";

import { useRouter } from "next/navigation";
import { BankAccount } from "@/types";
import KasModal from "../../KasModal";

export default function EditKasClient({ account }: { account: BankAccount }) {
    const router = useRouter();

    const handleClose = () => {
        router.push("/master/kas");
    };

    return (
        <KasModal 
            isOpen={true}
            onClose={handleClose}
            account={account}
        />
    );
}
