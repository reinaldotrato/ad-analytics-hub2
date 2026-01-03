import * as React from "react"
import { cn } from "@/lib/utils"

// Chart configuration types
export interface ChartConfig {
  [key: string]: {
    label?: string
    icon?: React.ComponentType<{ className?: string }>
    color?: string
    theme?: {
      light?: string
      dark?: string
    }
  }
}

interface ChartContextProps {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number
    payload?: Record<string, unknown>
    dataKey?: string
    color?: string
  }>
  label?: string
  labelFormatter?: (label: string, payload: unknown[]) => React.ReactNode
  formatter?: (value: number, name: string, item: unknown, index: number, payload: unknown[]) => React.ReactNode
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      {!hideLabel && (
        <div className="mb-1 font-medium">
          {labelFormatter ? labelFormatter(label || "", payload) : label}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, index) => {
          const key = nameKey ? String(item.payload?.[nameKey]) : item.name || item.dataKey
          const itemConfig = key ? config[key] : undefined
          const value = formatter
            ? formatter(item.value || 0, key || "", item, index, payload)
            : item.value

          return (
            <div key={index} className="flex items-center gap-2">
              {!hideIndicator && (
                <div
                  className={cn(
                    "shrink-0",
                    indicator === "dot" && "h-2.5 w-2.5 rounded-full",
                    indicator === "line" && "h-0.5 w-4",
                    indicator === "dashed" && "h-0.5 w-4 border-t-2 border-dashed"
                  )}
                  style={{
                    backgroundColor: indicator !== "dashed" ? (item.color || itemConfig?.color) : undefined,
                    borderColor: indicator === "dashed" ? (item.color || itemConfig?.color) : undefined,
                  }}
                />
              )}
              <span className="text-muted-foreground">
                {itemConfig?.label || key}:
              </span>
              <span className="font-medium">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChartLegend({ children }: { children?: React.ReactNode }) {
  return <div className="flex items-center justify-center gap-4">{children}</div>
}

export function ChartLegendContent({
  payload,
  nameKey,
}: {
  payload?: Array<{ value?: string; color?: string; dataKey?: string }>
  nameKey?: string
}) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {payload.map((item, index) => {
        const key = nameKey ? item.value : item.dataKey || item.value
        const itemConfig = key ? config[key] : undefined

        return (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color || itemConfig?.color }}
            />
            <span className="text-sm text-muted-foreground">
              {itemConfig?.label || key}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export { ChartContext }
