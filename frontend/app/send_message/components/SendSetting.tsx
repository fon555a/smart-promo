"use client"

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { PickerValue } from '@mui/x-date-pickers/internals';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

dayjs.extend(utc)
dayjs.extend(timezone)

interface Props {
  onNext: () => void,
  onBack: () => void,
  onEndDateChange: (date: PickerValue) => void,
  onStartDateChange: (date: PickerValue) => void,
  dateData: {
    startDateAndTime: PickerValue | null,
    endDateAndTime: PickerValue | null
  }
}

const SendSetting = ({ onNext, onBack, onStartDateChange, onEndDateChange, dateData }: Props) => {
  return (
    <div>


      <div className="flex flex-col overflow-auto gap-2 h-67">
        <div className="flex flex-col sm:flex-row sm:gap-15 gap-2 border-primary border-2 px-5 py-3 rounded-md">
          <div>
            <h1 className="text-primary font-bold text-2xl">1. วันและเวลาในการประกาศ</h1>
            <p className="text-secondary">วันและเวลาที่ข้อความและรูปภาพจะประกาศออกไป</p>
          </div>

          <div className="flex flex-col gap-2">
            {/* Start DatePicker */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileDateTimePicker
                label="เลือกเวลาที่จะเริ่มประกาศ"
                value={dateData.startDateAndTime ?
                  dayjs.utc(dateData.startDateAndTime).tz("Asia/Bangkok")
                  : dayjs.utc().tz("Asia/Bangkok")
                }
                views={["year", "month", "day", "hours", "minutes", "seconds"]}
                minutesStep={1}
                
                onChange={onStartDateChange}
                defaultValue={dayjs.utc(dateData.startDateAndTime).tz("Asia/Bangkok")}
                minDateTime={dayjs.utc().tz("Asia/Bangkok")}
                ampm={false}
                
              />
            
              <MobileDateTimePicker
                label="เลือกเวลาที่จะหยุดประกาศ"
                minDateTime={dateData.startDateAndTime || dayjs.utc().tz("Asia/Bangkok")}
                value={dateData.endDateAndTime ?
                  dayjs.utc(dateData.endDateAndTime).tz("Asia/Bangkok")
                  : dayjs.utc().tz("Asia/Bangkok")
                }
                views={["year", "month", "day", "hours", "minutes", "seconds"]}
                minutesStep={1}

                defaultValue={dayjs()}
                ampm={false}
                onChange={onEndDateChange}
              />
            </LocalizationProvider>
            {/* End DatePicker */}
          </div>

        </div>

      </div>
      <div className="flex justify-between">
        <button className="cursor-pointer bg-primary text-white px-5 py-1 rounded-md" onClick={onBack}>ย้อนกลับ</button>
        <button className="cursor-pointer bg-primary text-white px-5 py-1 rounded-md" onClick={onNext}>เริ่มประกาศ</button>
      </div>
    </div>
  )
}
export default SendSetting