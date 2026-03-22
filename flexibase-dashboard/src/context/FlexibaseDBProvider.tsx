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
  tableDetail: {
    name: string;
    noc: number;
  };
  setTableDetail: Dispatch<
    SetStateAction<{
      name: string;
      noc: number;
    }>
  >;
}

const Context = createContext<ContextProps>({
  triggerFetch: () => {},
  fetchKey: 0,
  tableDetail: { name: "", noc: 0 },
  setTableDetail: () => {},
});

const FlexibaseDBProvider = ({
  children,
}: {
  children: ReactNode | ReactNode[];
}) => {
  const [fetchKey, triggerFetch] = useState(0);

  const [tableDetail, setTableDetail] = useState({ name: "", noc: 0 });

  return (
    <Context.Provider
      value={{ fetchKey, triggerFetch, setTableDetail, tableDetail }}
    >
      {children}
    </Context.Provider>
  );
};

export const useFlexibaseDB = () => useContext(Context);

export default FlexibaseDBProvider;
