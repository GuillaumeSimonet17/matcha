import React from 'react'
import { InteractionsContextProvider } from "./interactionsContext";
import { UserContextProvider } from "./userContext";

export function Contexts({ children }) {
  return (
    <>
      <UserContextProvider>
        <InteractionsContextProvider>
					{children}
				</InteractionsContextProvider>
      </UserContextProvider>
    </>
  );
}
