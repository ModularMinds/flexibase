import {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
} from "react";

interface ContextProps {
  triggerFetch: Dispatch<SetStateAction<number>>;
  fetchKey: number;
}

const Context = createContext<ContextProps>({
  triggerFetch: () => {},
  fetchKey: 0,
});

const FlexibaseAuthProvider = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => {
  const [fetchKey, triggerFetch] = useState(0);

  return (
    <Context.Provider value={{ fetchKey, triggerFetch }}>
      {children}
    </Context.Provider>
  );
};

export const useFlexibaseAuth = () => useContext(Context);

export default FlexibaseAuthProvider;
