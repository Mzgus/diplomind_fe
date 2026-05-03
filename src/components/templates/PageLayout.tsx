import React from "react";
import SearchBar from "../molecules/SearchBar";
import Button from "../atoms/Buttons/Button";
import DataTable from "../organisms/DataTable";

interface ColumnDefinition {
  key: string;
  header: string;
}

interface PageLayoutProps {
  title: string;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder: string;
  buttonText?: string;
  onButtonClick?: () => void;
  extraButtonText?: string;
  onExtraButtonClick?: () => void;
  columns: ColumnDefinition[];
  data: Record<string, any>[];
  onEditRow?: (row: Record<string, any>) => void;
  onDeleteRow?: (row: Record<string, any>) => void;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  buttonText,
  onButtonClick,
  extraButtonText,
  onExtraButtonClick,
  columns,
  data,
  onEditRow,
  onDeleteRow,
}) => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-text-main">{title}</h1>
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="w-3/4">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
        <div className="w-1/4 flex gap-2">
          {buttonText && (
            <Button className="flex-1" onClick={onButtonClick}>
              {buttonText}
            </Button>
          )}
          {extraButtonText && onExtraButtonClick && (
            <Button className="flex-1" onClick={onExtraButtonClick}>
              {extraButtonText}
            </Button>
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        onEditRow={onEditRow}
        onDeleteRow={onDeleteRow}
      />
    </div>
  );
};

export default PageLayout;
