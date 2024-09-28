import React, { useState, useMemo } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Plus, X } from "lucide-react"

type AnalyticalRow = {
  id: string;
  contaminant: string;
  maximum: string;
  minimum: string;
  average: string;
  leachable: string;
}

type AnalyticalSummaryTableProps = {
  analyticalRows: AnalyticalRow[];
  updateAnalyticalRow: (id: string, field: keyof AnalyticalRow, value: string) => void;
  removeAnalyticalRow: (id: string) => void;
  addAnalyticalRow: (contaminant: string) => void;
  availableContaminants: string[];
}

export const AnalyticalSummaryTable: React.FC<AnalyticalSummaryTableProps> = ({
  analyticalRows,
  updateAnalyticalRow,
  removeAnalyticalRow,
  addAnalyticalRow,
  availableContaminants
}) => {
  const [newContaminant, setNewContaminant] = useState("")
  const [filteredContaminants, setFilteredContaminants] = useState<string[]>([])

  const handleContaminantSearch = (value: string) => {
    setNewContaminant(value)
    if (value.trim() === "") {
      setFilteredContaminants([])
    } else {
      setFilteredContaminants(
        availableContaminants.filter(contaminant => 
          contaminant.toLowerCase().includes(value.toLowerCase())
        )
      )
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contaminant</TableHead>
            <TableHead>Maximum reported Contaminant concentration (total) mg/kg dry weight</TableHead>
            <TableHead>Minimum reported Contaminant concentration (total) mg/kg dry weight</TableHead>
            <TableHead>Average reported Contaminant concentration (total) mg/kg dry weight Or 95%UCL average</TableHead>
            <TableHead>If available: Maximum Leachable Concentration (mg/L)</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analyticalRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.contaminant}</TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={row.maximum}
                  onChange={(e) => updateAnalyticalRow(row.id, "maximum", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={row.minimum}
                  onChange={(e) => updateAnalyticalRow(row.id, "minimum", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={row.average}
                  onChange={(e) => updateAnalyticalRow(row.id, "average", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={row.leachable}
                  onChange={(e) => updateAnalyticalRow(row.id, "leachable", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAnalyticalRow(row.id)}
                  aria-label={`Remove ${row.contaminant}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center space-x-2 mt-4">
        <div className="relative flex-grow">
          <Input
            placeholder="Search or add new contaminant"
            value={newContaminant}
            onChange={(e) => handleContaminantSearch(e.target.value)}
          />
          {filteredContaminants.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredContaminants.map((contaminant) => (
                <li
                  key={contaminant}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    addAnalyticalRow(contaminant)
                    setNewContaminant("")
                    setFilteredContaminants([])
                  }}
                >
                  {contaminant}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button onClick={() => addAnalyticalRow(newContaminant)} disabled={!newContaminant || analyticalRows.some(row => row.contaminant.toLowerCase() === newContaminant.toLowerCase())}>
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
      </div>
    </>
  )
}