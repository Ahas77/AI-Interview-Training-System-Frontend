import { createContext, useContext, useState } from "react";

type ChatContextType = {
  openModal: string | null;
  setOpenModal: (val: string | null) => void;
  subjectFromOutside: string | null;
  setSubjectFromOutside: (val: string | null) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: any}) => {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [subjectFromOutside, setSubjectFromOutside] = useState<string | null>(null);

  return (
    <ChatContext.Provider
      value={{ openModal, setOpenModal, subjectFromOutside, setSubjectFromOutside }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChatContext must be used inside ChatProvider");
  return context;
};
