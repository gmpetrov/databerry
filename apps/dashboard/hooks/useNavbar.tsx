import React, { createContext, ReactNode, useContext, useState } from 'react';

interface NavbarContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NavbarContext = createContext<NavbarContextValue>({
  open: false,
  setOpen: () => {},
});

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <NavbarContext.Provider value={{ open, setOpen }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => useContext(NavbarContext);
