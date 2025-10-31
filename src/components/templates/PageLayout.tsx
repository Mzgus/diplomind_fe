import React from "react";
import SearchBar from "../molecules/SearchBar";
import Button from "../atoms/Button";
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
  buttonText: string;
  onButtonClick?: () => void;
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
  columns,
  data,
  onEditRow,
  onDeleteRow,
}) => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">{title}</h1>
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="w-3/4">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
        <div className="w-1/4">
          <Button className="w-full" onClick={onButtonClick}>
            {buttonText}
          </Button>
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
