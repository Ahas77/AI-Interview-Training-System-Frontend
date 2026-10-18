import { createContext, useContext, useState, ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface PageMetadata {
  title: string;
  subtitle?: string | BreadcrumbItem[];
}

interface PageContextType {
  metadata: PageMetadata;
  setPageMetadata: (metadata: PageMetadata) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [metadata, setPageMetadata] = useState<PageMetadata>({
    title: "Dashboard",
    subtitle: undefined,
  });

  return (
    <PageContext.Provider value={{ metadata, setPageMetadata }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageMetadata = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePageMetadata must be used within PageProvider");
  }
  // Ensure metadata always has a default value
  return {
    ...context,
    metadata: context.metadata || { title: "Dashboard", subtitle: undefined },
  };
};
