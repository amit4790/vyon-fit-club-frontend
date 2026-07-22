/**
 * Table Component
 * Premium responsive table
 */

import React from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`table-wrapper ${className}`}>
      <table className="table">
        {children}
      </table>
    </div>
  )
}

interface TableHeaderProps {
  children: React.ReactNode
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="table-header">
      <tr>{children}</tr>
    </thead>
  )
}

interface TableHeaderCellProps {
  children: React.ReactNode
  className?: string
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, className = '' }) => {
  return <th className={`table-header-cell ${className}`}>{children}</th>
}

interface TableBodyProps {
  children: React.ReactNode
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody>{children}</tbody>
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
}

export const TableRow: React.FC<TableRowProps> = ({ children, className = '' }) => {
  return <tr className={`table-body-row ${className}`}>{children}</tr>
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
}

export const TableCell: React.FC<TableCellProps> = ({ children, className = '' }) => {
  return <td className={`table-body-cell ${className}`}>{children}</td>
}
