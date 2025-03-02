"use client"

import type React from "react"
import { DatePickerInput } from '@mantine/dates'

interface DatePickerProps {
  selected: Date
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
}

export const DatePicker: React.FC<DatePickerProps> = ({ selected, onChange, minDate, maxDate }) => {
  return (
    <DatePickerInput
      value={selected}
      onChange={(date) => date && onChange(date)}
      minDate={minDate}
      maxDate={maxDate}
      valueFormat="YYYY-MM-DD"
      clearable={false}
    />
  )
}
