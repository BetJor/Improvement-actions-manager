
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MasterDataItem } from "@/lib/types"

interface MasterDataTableProps {
  data: MasterDataItem[];
  columns: { key: string; label: string }[];
}

function MasterDataTable({ data, columns }: MasterDataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                {columns.map(col => <TableCell key={`${item.id}-${col.key}`}>{item[col.key]}</TableCell>)}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                No hi ha dades per mostrar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

interface MasterDataManagerProps {
  data: {
    [key: string]: {
      title: string;
      data: MasterDataItem[];
      columns: { key: string; label: string }[];
    };
  };
}

export function MasterDataManager({ data }: MasterDataManagerProps) {
  const dataKeys = Object.keys(data);
  
  return (
    <Tabs defaultValue={dataKeys[0]} className="w-full">
      <TabsList>
        {dataKeys.map(key => (
          <TabsTrigger key={key} value={key}>{data[key].title}</TabsTrigger>
        ))}
      </TabsList>
      {dataKeys.map(key => (
        <TabsContent key={key} value={key}>
          <MasterDataTable data={data[key].data} columns={data[key].columns} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
