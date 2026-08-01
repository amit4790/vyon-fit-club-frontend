/**
 * Table Component
 * Premium responsive table
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
  frozenColumnCount?: number
  stickyHeader?: boolean
  showTopScrollbar?: boolean
}

interface TableContextValue {
  columnLefts: number[]
  frozenColumnCount: number
  stickyHeader: boolean
  registerHeaderCell: (columnIndex: number, node: HTMLTableCellElement | null) => void
}

const TableContext = React.createContext<TableContextValue | null>(null)

function cloneCellsWithColumnIndex(children: React.ReactNode) {
  return React.Children.map(children, (child, columnIndex) => {
    if (!React.isValidElement(child)) {
      return child
    }

    return React.cloneElement(child as React.ReactElement<{ columnIndex?: number }>, {
      columnIndex,
    })
  })
}

export const Table: React.FC<TableProps> = ({
  children,
  className = '',
  frozenColumnCount = 3,
  stickyHeader = true,
  showTopScrollbar = true,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const tableRef = useRef<HTMLTableElement | null>(null)
  const topScrollRef = useRef<HTMLDivElement | null>(null)
  const headerCellRefs = useRef<Array<HTMLTableCellElement | null>>([])
  const [columnLefts, setColumnLefts] = useState<number[]>([])
  const [topScrollWidth, setTopScrollWidth] = useState(0)
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false)

  const registerHeaderCell = useCallback((columnIndex: number, node: HTMLTableCellElement | null) => {
    headerCellRefs.current[columnIndex] = node
  }, [])

  const measureLayout = useCallback(() => {
    const wrapper = wrapperRef.current
    const table = tableRef.current

    if (!wrapper || !table) {
      return
    }

    const scrollWidth = table.scrollWidth
    const nextHasOverflow = scrollWidth > wrapper.clientWidth + 1
    setTopScrollWidth(scrollWidth)
    setHasHorizontalOverflow(nextHasOverflow)

    const frozenCount = Math.min(frozenColumnCount, headerCellRefs.current.length)
    const nextColumnLefts: number[] = []
    let currentLeft = 0

    for (let columnIndex = 0; columnIndex < frozenCount; columnIndex += 1) {
      nextColumnLefts[columnIndex] = currentLeft
      currentLeft += headerCellRefs.current[columnIndex]?.getBoundingClientRect().width ?? 0
    }

    setColumnLefts((previous) => {
      if (
        previous.length === nextColumnLefts.length &&
        previous.every((value, index) => value === nextColumnLefts[index])
      ) {
        return previous
      }

      return nextColumnLefts
    })
  }, [frozenColumnCount])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const topScroll = topScrollRef.current

    if (!wrapper || !topScroll || !showTopScrollbar || !hasHorizontalOverflow) {
      return
    }

    let syncingFromWrapper = false
    let syncingFromTop = false

    const syncTopScroll = () => {
      if (syncingFromTop) {
        syncingFromTop = false
        return
      }

      syncingFromWrapper = true
      topScroll.scrollLeft = wrapper.scrollLeft
    }

    const syncTableScroll = () => {
      if (syncingFromWrapper) {
        syncingFromWrapper = false
        return
      }

      syncingFromTop = true
      wrapper.scrollLeft = topScroll.scrollLeft
    }

    wrapper.addEventListener('scroll', syncTopScroll, { passive: true })
    topScroll.addEventListener('scroll', syncTableScroll, { passive: true })

    return () => {
      wrapper.removeEventListener('scroll', syncTopScroll)
      topScroll.removeEventListener('scroll', syncTableScroll)
    }
  }, [hasHorizontalOverflow, showTopScrollbar])

  useEffect(() => {
    measureLayout()

    const resizeObserver = new ResizeObserver(() => {
      measureLayout()
    })

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current)
    }

    if (tableRef.current) {
      resizeObserver.observe(tableRef.current)
    }

    headerCellRefs.current.forEach((cell) => {
      if (cell) {
        resizeObserver.observe(cell)
      }
    })

    window.addEventListener('resize', measureLayout)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', measureLayout)
    }
  }, [children, measureLayout])

  const contextValue = useMemo<TableContextValue>(
    () => ({
      columnLefts,
      frozenColumnCount,
      stickyHeader,
      registerHeaderCell,
    }),
    [columnLefts, frozenColumnCount, registerHeaderCell, stickyHeader]
  )

  return (
    <TableContext.Provider value={contextValue}>
      <div className={`table-shell ${className}`}>
        {showTopScrollbar && hasHorizontalOverflow ? (
          <div ref={topScrollRef} className="table-top-scrollbar" aria-hidden="true">
            <div className="table-top-scrollbar-spacer" style={{ width: topScrollWidth }} />
          </div>
        ) : null}

        <div ref={wrapperRef} className="table-wrapper">
          <table ref={tableRef} className="table">
            {children}
          </table>
        </div>
      </div>
    </TableContext.Provider>
  )
}

interface TableHeaderProps {
  children: React.ReactNode
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="table-header">
      <tr>{cloneCellsWithColumnIndex(children)}</tr>
    </thead>
  )
}

interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  columnIndex?: number
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  className = '',
  columnIndex,
  style,
  ...props
}) => {
  const context = React.useContext(TableContext)
  const isFrozen =
    context && typeof columnIndex === 'number' && columnIndex < context.frozenColumnCount
  const frozenLeft = typeof columnIndex === 'number' ? context?.columnLefts[columnIndex] ?? 0 : 0

  return (
    <th
      {...props}
      ref={(node) => {
        if (context && typeof columnIndex === 'number') {
          context.registerHeaderCell(columnIndex, node)
        }
      }}
      scope={props.scope || 'col'}
      className={[
        'table-header-cell',
        context?.stickyHeader ? 'table-sticky-header' : '',
        isFrozen ? 'table-sticky-column' : '',
        isFrozen && columnIndex === context.frozenColumnCount - 1 ? 'table-sticky-boundary' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        ...style,
        ...(isFrozen && typeof columnIndex === 'number' ? { left: frozenLeft, zIndex: 45 - columnIndex } : {}),
      }}
    >
      {children}
    </th>
  )
}

interface TableBodyProps {
  children: React.ReactNode
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody>{children}</tbody>
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
  className?: string
}

export const TableRow: React.FC<TableRowProps> = ({ children, className = '', ...props }) => {
  return <tr className={`table-body-row ${className}`} {...props}>{cloneCellsWithColumnIndex(children)}</tr>
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  columnIndex?: number
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  columnIndex,
  style,
  ...props
}) => {
  const context = React.useContext(TableContext)
  const isFrozen =
    context && typeof columnIndex === 'number' && columnIndex < context.frozenColumnCount
  const frozenLeft = typeof columnIndex === 'number' ? context?.columnLefts[columnIndex] ?? 0 : 0

  return (
    <td
      {...props}
      className={[
        'table-body-cell',
        isFrozen ? 'table-sticky-column' : '',
        isFrozen && columnIndex === context.frozenColumnCount - 1 ? 'table-sticky-boundary' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        ...style,
        ...(isFrozen && typeof columnIndex === 'number' ? { left: frozenLeft, zIndex: 20 - columnIndex } : {}),
      }}
    >
      {children}
    </td>
  )
}
