/**
 * Example Content SDK (Next.js) component that renders the JSON saved by the
 * Grid Composer custom field.
 *
 * Copy this into your head app (for example src/components/grid-table/),
 * register it in your component map, and point the `Table` field name below
 * at whatever you called the field on your template.
 *
 * No client-side JavaScript needed, so this works as a server component.
 * This file is excluded from the Marketplace app's own build.
 */

import type { CSSProperties } from 'react';
import type { ComponentParams, ComponentRendering, Field } from '@sitecore-content-sdk/nextjs';

interface CellFormat {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  backgroundColor?: string;
  wrap?: boolean;
}

interface TableData {
  version: string;
  rows: { id: string; isHeader?: boolean; cells: { id: string; content: string; format?: CellFormat }[] }[];
  columns: { id: string; label?: string; width?: string }[];
  settings?: {
    caption?: string;
    hasBorders?: boolean;
    isStriped?: boolean;
    defaultCellFormat?: CellFormat;
  };
}

interface GridTableProps {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields: {
    Table: Field<string>;
  };
}

const FONT_WEIGHTS: Record<NonNullable<CellFormat['fontWeight']>, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// Only allow plain colors through to inline styles
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|[a-z]+)$/i;

function parseTable(raw: string | undefined): TableData | null {
  if (!raw?.trim()) return null;
  try {
    const data = JSON.parse(raw) as TableData;
    return Array.isArray(data.rows) && Array.isArray(data.columns) ? data : null;
  } catch {
    return null;
  }
}

function cellStyle(format: CellFormat | undefined, fallback: CellFormat | undefined): CSSProperties {
  const f = { ...fallback, ...format };
  return {
    textAlign: f.align,
    verticalAlign: f.verticalAlign,
    fontWeight: f.fontWeight ? FONT_WEIGHTS[f.fontWeight] : undefined,
    color: f.color && SAFE_COLOR.test(f.color) ? f.color : undefined,
    backgroundColor: f.backgroundColor && SAFE_COLOR.test(f.backgroundColor) ? f.backgroundColor : undefined,
    whiteSpace: f.wrap === false ? 'nowrap' : undefined,
  };
}

export const Default = ({ fields, params }: GridTableProps) => {
  const table = parseTable(fields?.Table?.value);
  if (!table || table.rows.length === 0) return null;

  const headerRows = table.rows.filter((row) => row.isHeader);
  const bodyRows = table.rows.filter((row) => !row.isHeader);
  const defaults = table.settings?.defaultCellFormat;

  const classes = [
    'grid-table',
    table.settings?.hasBorders && 'grid-table--bordered',
    table.settings?.isStriped && 'grid-table--striped',
    params?.styles,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    // Wide tables scroll sideways on small screens instead of breaking layout
    <div className="grid-table__scroll" style={{ overflowX: 'auto' }}>
      <table className={classes}>
        {table.settings?.caption && <caption>{table.settings.caption}</caption>}

        <colgroup>
          {table.columns.map((column) => (
            <col key={column.id} style={{ width: column.width && column.width !== 'auto' ? column.width : undefined }} />
          ))}
        </colgroup>

        {headerRows.length > 0 && (
          <thead>
            {headerRows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell) => (
                  <th key={cell.id} scope="col" style={cellStyle(cell.format, defaults)}>
                    {cell.content}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        )}

        <tbody>
          {bodyRows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell) => (
                <td key={cell.id} style={cellStyle(cell.format, defaults)}>
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
