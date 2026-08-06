"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import ContactModal from "@/app/components/contacto/ContactModal";

type ContactModalContextValue = {
  openModal: () => void;
  closeModal: () => void;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<ContactModalContextValue>(
    () => ({
      openModal: () => setIsOpen(true),
      closeModal: () => setIsOpen(false),
    }),
    []
  );

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen && <ContactModal onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error("useContactModal debe usarse dentro de ContactModalProvider");
  }
  return ctx;
}
